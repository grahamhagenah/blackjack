import { useCallback, useEffect, useRef, useState } from "react";
import { DEAL_INTERVAL_MS, DEALING_DELAY_MS } from "../constants";

const HAND_SIZE = 6;
const STARTING_SCORE = 200;
const SCORE_DELTA = 20;
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

const createEmptyHand = () => Array(HAND_SIZE).fill("");

const drawRandomCard = (deck) => {
  const index = Math.floor(Math.random() * deck.length);
  const card = deck[index];
  const nextDeck = deck.slice(0, index).concat(deck.slice(index + 1));
  return { card, deck: nextDeck };
};

const cardValue = (card) => {
  if (card === "") return 0;
  if (isNaN(card)) {
    switch (card) {
      case "A":
        return 11;
      case "J":
      case "Q":
      case "K":
        return 10;
      default:
        return card;
    }
  }
  return card;
};

const calculateTotal = (hand) => {
  let sum = 0;
  let aces = 0;
  for (let i = 0; i < hand.length; i += 1) {
    const value = cardValue(hand[i]);
    if (value === 11) aces += 1;
    sum += value;
  }
  while (aces > 0 && sum > 21) {
    sum -= 10;
    aces -= 1;
  }
  return sum;
};

const evaluateWinner = ({
  total,
  cardCount,
  dealersTurn,
  playerTotal,
  dealerTotal,
}) => {
  if (total > 21 && !dealersTurn) {
    return { gameOver: true, playerWins: false };
  }
  if (total > 21 && dealersTurn) {
    return { gameOver: true, playerWins: true };
  }
  // Six-card Charlie: filling every slot without busting wins the hand
  if (cardCount >= HAND_SIZE) {
    return { gameOver: true, playerWins: !dealersTurn };
  }
  // Equal totals after the dealer stands is a push
  if (dealersTurn && dealerTotal > 16 && playerTotal === dealerTotal) {
    return { gameOver: true, playerWins: false, push: true };
  }
  if (dealersTurn && dealerTotal > 16 && playerTotal > dealerTotal) {
    return { gameOver: true, playerWins: true };
  }
  if (dealersTurn && dealerTotal > 16 && playerTotal < dealerTotal) {
    return { gameOver: true, playerWins: false };
  }
  return { gameOver: false, playerWins: false };
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
      loadBuffer("player", `${process.env.PUBLIC_URL}/player.wav`, 0.22),
      loadBuffer("dealer", `${process.env.PUBLIC_URL}/retro-dealer.wav`, 0.2),
      loadBuffer("reset", `${process.env.PUBLIC_URL}/retro-reset.wav`, 0.25),
      loadBuffer("bust", `${process.env.PUBLIC_URL}/retro-bust.wav`, 0.25),
      loadBuffer("lose", `${process.env.PUBLIC_URL}/down.wav`, 0.25),
      loadBuffer("win", `${process.env.PUBLIC_URL}/win.wav`, 0.12),
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
    doubledRef.current = false;
    if (doubleStandRef.current) {
      clearTimeout(doubleStandRef.current);
      doubleStandRef.current = null;
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
    ({ gameOver: isGameOver, playerWins: didWin, push: isPush }) => {
      if (!isGameOver) return;
      const stake = doubledRef.current ? SCORE_DELTA * 2 : SCORE_DELTA;
      const delta = isPush ? 0 : didWin ? stake : -stake;
      setChange(delta);
      setScore(score + delta);
      setGameOver(true);
      setPlayerWins(didWin);
    },
    [score]
  );

  const hitPlayer = useCallback(() => {
    if (gameOver || !playersTurn) return;
    if (beginningState) setBeginningState(false);
    const current = stateRef.current;
    if (!current || current.deck.length === 0) return;
    if (nextPlayerIndexRef.current >= HAND_SIZE) return;
    const { card, deck: nextDeck } = drawRandomCard(current.deck);
    const nextHand = current.playerHand.slice();
    const index = nextPlayerIndexRef.current;
    nextHand[index] = card;
    nextPlayerIndexRef.current = index + 1;
    const nextTotal = calculateTotal(nextHand);
    stateRef.current = {
      ...current,
      deck: nextDeck,
      playerHand: nextHand,
      playerTotal: nextTotal,
      nextPlayerIndex: index + 1,
    };
    setDeck(nextDeck);
    setPlayerHand(nextHand);
    setPlayerTotal(nextTotal);
    const outcome = evaluateWinner({
        total: nextTotal,
        cardCount: index + 1,
        dealersTurn: false,
        playerTotal: nextTotal,
        dealerTotal: current.dealerTotal,
      });

    if (outcome.gameOver && nextTotal > 21) {
      ensureAudioUnlocked();
      suppressNextPlayerSoundRef.current = true;
      playSound("bust");
    }

    applyOutcome(outcome);
  }, [
    gameOver,
    playersTurn,
    beginningState,
    applyOutcome,
    ensureAudioUnlocked,
    playSound,
  ]);

  const hitDealer = useCallback(() => {
    if (gameOver) return;
    if (beginningState) setBeginningState(false);
    const current = stateRef.current;
    if (!current || current.deck.length === 0) return;
    if (nextDealerIndexRef.current >= HAND_SIZE) return;
    const { card, deck: nextDeck } = drawRandomCard(current.deck);
    const nextHand = current.dealerHand.slice();
    const index = nextDealerIndexRef.current;
    nextHand[index] = card;
    nextDealerIndexRef.current = index + 1;
    const nextTotal = calculateTotal(nextHand);
    stateRef.current = {
      ...current,
      deck: nextDeck,
      dealerHand: nextHand,
      dealerTotal: nextTotal,
      nextDealerIndex: index + 1,
    };
    setDeck(nextDeck);
    setDealerHand(nextHand);
    setNextDealerIndex(index + 1);
    setDealerTotal(nextTotal);
    const outcome = evaluateWinner({
        total: nextTotal,
        cardCount: index + 1,
        dealersTurn: true,
        playerTotal: current.playerTotal,
        dealerTotal: nextTotal,
      });

    if (outcome.gameOver && nextTotal > 21) {
      ensureAudioUnlocked();
      suppressNextDealerSoundRef.current = true;
      playSound("bust");
    }

    applyOutcome(outcome);
  }, [gameOver, beginningState, applyOutcome, ensureAudioUnlocked, playSound]);

  const deal = useCallback(() => {
    ensureAudioUnlocked();
    if (!playersTurn) return;
    if (beginningState) {
      // Opening deal like the handheld: two cards for the player and one
      // face-up card for the dealer, who draws the rest after the player stands
      hitPlayer();
      hitPlayer();
      suppressNextDealerSoundRef.current = true;
      hitDealer();
      return;
    }
    hitPlayer();
  }, [ensureAudioUnlocked, playersTurn, beginningState, hitPlayer, hitDealer]);

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
      if (dealingDelayRef.current) clearTimeout(dealingDelayRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const canDouble =
    playersTurn &&
    !gameOver &&
    !doubled &&
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
    doubled,
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
