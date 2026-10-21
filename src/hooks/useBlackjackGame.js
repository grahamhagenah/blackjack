import { useCallback, useEffect, useRef, useState } from "react";
import { DEAL_INTERVAL_MS, DEALING_DELAY_MS } from "../constants";
import {
  HAND_SIZE,
  STARTING_SCORE,
  calculateTotal,
  createEmptyHand,
  drawRandomCard,
  evaluateWinner,
  isNatural,
  scoreChange,
} from "../game/rules";

const SCORE_STORAGE_KEY = "retro-blackjack-score";

// Pick up the score from the last visit; storage can be unavailable (private mode)
const loadScore = () => {
  try {
    const saved = Number(window.localStorage.getItem(SCORE_STORAGE_KEY));
    return Number.isFinite(saved) && saved > 0 ? saved : STARTING_SCORE;
  } catch {
    return STARTING_SCORE;
  }
};

const useBlackjackGame = (cards) => {
  const [deck, setDeck] = useState(() => cards.slice());
  const [beginningState, setBeginningState] = useState(true);
  const [playerHand, setPlayerHand] = useState(createEmptyHand);
  const [dealerHand, setDealerHand] = useState(createEmptyHand);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [nextDealerIndex, setNextDealerIndex] = useState(0);
  const [playersTurn, setPlayersTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [playerWins, setPlayerWins] = useState(false);
  const [score, setScore] = useState(loadScore);
  const [change, setChange] = useState(0);
  const [switchView, setSwitchView] = useState(false);
  const [muted, setMuted] = useState(false);
  const [doubled, setDoubled] = useState(false);
  // Controls are locked while a double or a blackjack plays out
  const [locked, setLocked] = useState(false);
  const [blackjack, setBlackjack] = useState(false);

  const audioContextRef = useRef(null);
  const audioBuffersRef = useRef({});
  const prevTotalsRef = useRef({ player: 0, dealer: 0 });
  const didMountRef = useRef(false);
  const suppressSoundRef = useRef(false);
  const suppressNextPlayerSoundRef = useRef(false);
  const suppressNextDealerSoundRef = useRef(false);
  const intervalRef = useRef(null);
  const dealingDelayRef = useRef(null);
  const doubleStandRef = useRef(null);
  const naturalRef = useRef(null);
  const doubledRef = useRef(false);
  const stateRef = useRef(null);
  const nextDealerIndexRef = useRef(0);
  const nextPlayerIndexRef = useRef(0);

  useEffect(() => {
    stateRef.current = {
      deck,
      playerHand,
      dealerHand,
      playerTotal,
      dealerTotal,
      nextDealerIndex,
      playersTurn,
      gameOver,
    };
  }, [
    deck,
    playerHand,
    dealerHand,
    playerTotal,
    dealerTotal,
    nextDealerIndex,
    playersTurn,
    gameOver,
  ]);

  const ensureAudioUnlocked = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state !== "running") {
      ctx.resume().catch(() => {});
    }
  }, []);

  const playSound = useCallback(
    (key) => {
      if (muted) return;
      const ctx = audioContextRef.current;
      const entry = audioBuffersRef.current[key];
      if (!ctx || !entry?.buffer) return;
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      gain.gain.value = entry.volume;
      source.buffer = entry.buffer;
      source.connect(gain).connect(ctx.destination);
      source.start(0);
    },
    [muted]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.AudioContext) return;
    const ctx = new window.AudioContext();
    audioContextRef.current = ctx;

    const loadBuffer = async (key, url, volume) => {
      const response = await fetch(url);
      const data = await response.arrayBuffer();
      const buffer = await ctx.decodeAudioData(data);
      audioBuffersRef.current[key] = { buffer, volume };
    };

    Promise.all([
      loadBuffer("player", `${import.meta.env.BASE_URL}player.wav`, 0.22),
      loadBuffer("dealer", `${import.meta.env.BASE_URL}retro-dealer.wav`, 0.2),
      loadBuffer("bust", `${import.meta.env.BASE_URL}retro-bust.wav`, 0.25),
      loadBuffer("lose", `${import.meta.env.BASE_URL}down.wav`, 0.25),
      loadBuffer("win", `${import.meta.env.BASE_URL}win.wav`, 0.12),
    ]).catch(() => {});

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevTotalsRef.current = { player: playerTotal, dealer: dealerTotal };
      return;
    }
    if (suppressSoundRef.current) {
      suppressSoundRef.current = false;
      prevTotalsRef.current = { player: playerTotal, dealer: dealerTotal };
      return;
    }
    const prev = prevTotalsRef.current;
    const playerChanged = prev.player !== playerTotal;
    const dealerChanged = prev.dealer !== dealerTotal;
    if (playerChanged) {
      if (suppressNextPlayerSoundRef.current) {
        suppressNextPlayerSoundRef.current = false;
      } else {
        playSound("player");
      }
    }
    if (dealerChanged) {
      if (suppressNextDealerSoundRef.current) {
        suppressNextDealerSoundRef.current = false;
      } else {
        playSound("dealer");
      }
    }
    prevTotalsRef.current = { player: playerTotal, dealer: dealerTotal };
  }, [playerTotal, dealerTotal, playSound]);

  const stopDealer = useCallback(() => {
    if (dealingDelayRef.current) {
      clearTimeout(dealingDelayRef.current);
      dealingDelayRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearState = useCallback(() => {
    ensureAudioUnlocked();
    suppressSoundRef.current = true;
    setPlayerHand(createEmptyHand());
    setDealerHand(createEmptyHand());
    setPlayerTotal(0);
    setDealerTotal(0);
    setDeck(cards.slice());
    setNextDealerIndex(0);
    nextDealerIndexRef.current = 0;
    nextPlayerIndexRef.current = 0;
    setBeginningState(true);
    setSwitchView(false);
    setPlayersTurn(true);
    setGameOver(false);
    setPlayerWins(false);
    setDoubled(false);
    setLocked(false);
    setBlackjack(false);
    doubledRef.current = false;
    if (doubleStandRef.current) {
      clearTimeout(doubleStandRef.current);
      doubleStandRef.current = null;
    }
    if (naturalRef.current) {
      clearTimeout(naturalRef.current);
      naturalRef.current = null;
    }
    stopDealer();
  }, [cards, ensureAudioUnlocked, stopDealer]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SCORE_STORAGE_KEY, String(score));
    } catch {
      // Score just won't survive a reload
    }
  }, [score]);

  const newGame = useCallback(() => {
    setScore(STARTING_SCORE);
    setChange(0);
    clearState();
  }, [clearState]);

  const applyOutcome = useCallback(
    (outcome) => {
      if (!outcome.gameOver) return;
      const delta = scoreChange(outcome, { doubled: doubledRef.current });
      setChange(delta);
      setScore(score + delta);
      setGameOver(true);
      setPlayerWins(outcome.playerWins);
      setBlackjack(Boolean(outcome.natural && outcome.playerWins));
    },
    [score]
  );

  // Put the next card from the deck into the player's or dealer's hand.
  // Returns the new total and card count, or null if no card could be drawn.
  const drawCard = useCallback((side) => {
    const current = stateRef.current;
    const indexRef = side === "player" ? nextPlayerIndexRef : nextDealerIndexRef;
    if (!current || current.deck.length === 0) return null;
    if (indexRef.current >= HAND_SIZE) return null;
    const { card, deck: nextDeck } = drawRandomCard(current.deck);
    const handKey = side === "player" ? "playerHand" : "dealerHand";
    const nextHand = current[handKey].slice();
    const index = indexRef.current;
    nextHand[index] = card;
    indexRef.current = index + 1;
    const nextTotal = calculateTotal(nextHand);
    setDeck(nextDeck);
    if (side === "player") {
      stateRef.current = {
        ...current,
        deck: nextDeck,
        playerHand: nextHand,
        playerTotal: nextTotal,
      };
      setPlayerHand(nextHand);
      setPlayerTotal(nextTotal);
    } else {
      stateRef.current = {
        ...current,
        deck: nextDeck,
        dealerHand: nextHand,
        dealerTotal: nextTotal,
        nextDealerIndex: index + 1,
      };
      setDealerHand(nextHand);
      setNextDealerIndex(index + 1);
      setDealerTotal(nextTotal);
    }
    return { total: nextTotal, cardCount: index + 1, hand: nextHand };
  }, []);

  const hitPlayer = useCallback(() => {
    if (gameOver || !playersTurn) return;
    if (beginningState) setBeginningState(false);
    const drawn = drawCard("player");
    if (!drawn) return;
    const outcome = evaluateWinner({
      total: drawn.total,
      cardCount: drawn.cardCount,
      dealersTurn: false,
      playerTotal: drawn.total,
      dealerTotal: stateRef.current.dealerTotal,
    });

    if (outcome.gameOver && drawn.total > 21) {
      ensureAudioUnlocked();
      suppressNextPlayerSoundRef.current = true;
      playSound("bust");
    }

    applyOutcome(outcome);
  }, [
    gameOver,
    playersTurn,
    beginningState,
    drawCard,
    applyOutcome,
    ensureAudioUnlocked,
    playSound,
  ]);

  const hitDealer = useCallback(() => {
    if (gameOver) return;
    if (beginningState) setBeginningState(false);
    const drawn = drawCard("dealer");
    if (!drawn) return;
    const outcome = evaluateWinner({
      total: drawn.total,
      cardCount: drawn.cardCount,
      dealersTurn: true,
      playerTotal: stateRef.current.playerTotal,
      dealerTotal: drawn.total,
    });

    if (outcome.gameOver && drawn.total > 21) {
      ensureAudioUnlocked();
      suppressNextDealerSoundRef.current = true;
      playSound("bust");
    }

    applyOutcome(outcome);
  }, [gameOver, beginningState, drawCard, applyOutcome, ensureAudioUnlocked, playSound]);

  // A dealt blackjack ends the hand: the dealer turns over a second card,
  // and only a dealer blackjack too makes it a push
  const resolveNatural = useCallback(() => {
    setSwitchView(true);
    const drawn = drawCard("dealer");
    const dealerNatural = drawn ? isNatural(drawn.hand) : false;
    applyOutcome(
      dealerNatural
        ? { gameOver: true, playerWins: false, push: true }
        : { gameOver: true, playerWins: true, natural: true }
    );
  }, [drawCard, applyOutcome]);

  const deal = useCallback(() => {
    ensureAudioUnlocked();
    if (!playersTurn) return;
    // One card per press. The first press also turns up the dealer's card;
    // the dealer draws the rest after the player stands.
    hitPlayer();
    if (beginningState) {
      suppressNextDealerSoundRef.current = true;
      hitDealer();
      return;
    }
    if (isNatural(stateRef.current.playerHand)) {
      // A blackjack on the first two cards: let "Blackjack!" show before the
      // dealer's second card settles it
      setLocked(true);
      naturalRef.current = setTimeout(() => {
        naturalRef.current = null;
        resolveNatural();
      }, DEAL_INTERVAL_MS);
    }
  }, [
    ensureAudioUnlocked,
    playersTurn,
    beginningState,
    hitPlayer,
    hitDealer,
    resolveNatural,
  ]);

  const autoDeal = useCallback(() => {
    stopDealer();
    const drawDealerCard = () => {
      const current = stateRef.current;
      if (!current || current.gameOver) {
        stopDealer();
        return;
      }
      const dealerSum = calculateTotal(current.dealerHand);
      if (dealerSum < 17) {
        hitDealer();
      } else {
        stopDealer();
      }
    };
    // Wait for "Dealing" to show so every dealer card lands DEAL_INTERVAL_MS apart
    dealingDelayRef.current = setTimeout(() => {
      dealingDelayRef.current = null;
      intervalRef.current = setInterval(drawDealerCard, DEAL_INTERVAL_MS);
    }, DEALING_DELAY_MS);
  }, [hitDealer, stopDealer]);

  const stand = useCallback(() => {
    ensureAudioUnlocked();
    if (!playersTurn || gameOver) return;
    setPlayersTurn(false);
    setSwitchView(true);
    autoDeal();
  }, [ensureAudioUnlocked, playersTurn, gameOver, autoDeal]);

  // Double down: on exactly two cards, double the stake, take one card, then stand
  const double = useCallback(() => {
    ensureAudioUnlocked();
    if (!playersTurn || gameOver || doubledRef.current) return;
    if (nextPlayerIndexRef.current !== 2) return;
    doubledRef.current = true;
    setDoubled(true);
    setLocked(true);
    hitPlayer();
    if (stateRef.current.playerTotal > 21) return;
    // Leave the drawn card on screen for a beat before the dealer plays
    doubleStandRef.current = setTimeout(() => {
      doubleStandRef.current = null;
      stand();
    }, DEAL_INTERVAL_MS);
  }, [ensureAudioUnlocked, playersTurn, gameOver, hitPlayer, stand]);

  const switchHandView = useCallback(() => {
    ensureAudioUnlocked();
    setSwitchView((prev) => !prev);
  }, [ensureAudioUnlocked]);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const playEndGameSound = useCallback(
    (didWin) => {
      ensureAudioUnlocked();
      playSound(didWin ? "win" : "lose");
    },
    [ensureAudioUnlocked, playSound]
  );

  const playDealingSound = useCallback(() => {
    ensureAudioUnlocked();
    playSound("dealer");
  }, [ensureAudioUnlocked, playSound]);

  useEffect(() => {
    return () => {
      if (doubleStandRef.current) clearTimeout(doubleStandRef.current);
      if (naturalRef.current) clearTimeout(naturalRef.current);
      if (dealingDelayRef.current) clearTimeout(dealingDelayRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const canDouble =
    playersTurn &&
    !gameOver &&
    !doubled &&
    !locked &&
    playerHand.filter(Boolean).length === 2;

  return {
    beginningState,
    playerHand,
    dealerHand,
    playerTotal,
    dealerTotal,
    nextDealerIndex,
    playersTurn,
    gameOver,
    playerWins,
    score,
    change,
    muted,
    switchView,
    locked,
    blackjack,
    canDouble,
    deal,
    stand,
    double,
    clearState,
    newGame,
    outOfPoints: gameOver && score <= 0,
    switchHandView,
    toggleMuted,
    playEndGameSound,
    playDealingSound,
  };
};

export default useBlackjackGame;
