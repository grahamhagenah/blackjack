import { useCallback, useEffect, useRef, useState } from "react";
import { DEAL_INTERVAL_MS } from "../constants";

const HAND_SIZE = 6;
const STARTING_SCORE = 200;
const SCORE_DELTA = 20;

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

const evaluateWinner = ({ total, dealersTurn, playerTotal, dealerTotal }) => {
  if (total > 21 && !dealersTurn) {
    return { gameOver: true, playerWins: false };
  }
  if (total > 21 && dealersTurn) {
    return { gameOver: true, playerWins: true };
  }
  // If totals are equal after dealer finishes, don't end game - let player choose to push
  if (dealersTurn && dealerTotal > 16 && playerTotal === dealerTotal) {
    return { gameOver: false, playerWins: false };
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
  const [score, setScore] = useState(STARTING_SCORE);
  const [change, setChange] = useState(0);
  const [switchView, setSwitchView] = useState(false);
  const [muted, setMuted] = useState(false);

  const playerSoundRef = useRef(null);
  const dealerSoundRef = useRef(null);
  const resetSoundRef = useRef(null);
  const prevTotalsRef = useRef({ player: 0, dealer: 0 });
  const didMountRef = useRef(false);
  const suppressSoundRef = useRef(false);
  const intervalRef = useRef(null);
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

  useEffect(() => {
    playerSoundRef.current = new Audio("/retro-player.wav");
    dealerSoundRef.current = new Audio("/retro-dealer.wav");
    resetSoundRef.current = new Audio("/retro-reset.wav");
    playerSoundRef.current.volume = 0.22;
    dealerSoundRef.current.volume = 0.2;
    resetSoundRef.current.volume = 0.25;
  }, []);

  useEffect(() => {
    const nextMuted = Boolean(muted);
    if (playerSoundRef.current) playerSoundRef.current.muted = nextMuted;
    if (dealerSoundRef.current) dealerSoundRef.current.muted = nextMuted;
    if (resetSoundRef.current) resetSoundRef.current.muted = nextMuted;
  }, [muted]);

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
    if (playerChanged && playerSoundRef.current) {
      try {
        playerSoundRef.current.currentTime = 0;
        playerSoundRef.current.play();
      } catch (e) {
        // ignore autoplay errors
      }
    }
    if (dealerChanged && dealerSoundRef.current) {
      try {
        dealerSoundRef.current.currentTime = 0;
        dealerSoundRef.current.play();
      } catch (e) {
        // ignore autoplay errors
      }
    }
    prevTotalsRef.current = { player: playerTotal, dealer: dealerTotal };
  }, [playerTotal, dealerTotal]);

  const clearState = useCallback(() => {
    suppressSoundRef.current = true;
    if (resetSoundRef.current) {
      try {
        resetSoundRef.current.currentTime = 0;
        resetSoundRef.current.play();
      } catch (e) {
        // ignore autoplay errors
      }
    }
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [cards]);

  const applyOutcome = useCallback(
    ({ gameOver: isGameOver, playerWins: didWin }) => {
      if (!isGameOver) return;
      const delta = didWin ? SCORE_DELTA : -SCORE_DELTA;
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
    applyOutcome(
      evaluateWinner({
        total: nextTotal,
        dealersTurn: false,
        playerTotal: nextTotal,
        dealerTotal: current.dealerTotal,
      })
    );
  }, [gameOver, playersTurn, beginningState, applyOutcome]);

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
    applyOutcome(
      evaluateWinner({
        total: nextTotal,
        dealersTurn: true,
        playerTotal: current.playerTotal,
        dealerTotal: nextTotal,
      })
    );
  }, [gameOver, beginningState, applyOutcome]);

  const deal = useCallback(() => {
    if (playersTurn) hitPlayer();
  }, [playersTurn, hitPlayer]);

  const stopDealer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const autoDeal = useCallback(() => {
    stopDealer();
    intervalRef.current = setInterval(() => {
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
        if (!current.gameOver) {
          // Dealer finished, game not over (totals must be equal) - let player choose to push
          setPlayersTurn(true);
          setSwitchView(false);
        }
      }
    }, DEAL_INTERVAL_MS);
  }, [hitDealer, stopDealer]);

  const stand = useCallback(() => {
    if (!playersTurn || gameOver) return;
    setPlayersTurn(false);
    setSwitchView(true);
    autoDeal();
  }, [playersTurn, gameOver, autoDeal]);

  const push = useCallback(() => {
    if (!playersTurn || gameOver) return;
    // End game as a tie - no score change
    setChange(0);
    setGameOver(true);
    setPlayerWins(false); // Not a win, but not a loss either
  }, [playersTurn, gameOver]);

  const switchHandView = useCallback(() => {
    setSwitchView((prev) => !prev);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    beginningState,
    playerHand,
    dealerHand,
    playerTotal,
    dealerTotal,
    playersTurn,
    gameOver,
    playerWins,
    score,
    change,
    muted,
    switchView,
    deal,
    stand,
    push,
    clearState,
    switchHandView,
    toggleMuted,
  };
};

export default useBlackjackGame;
