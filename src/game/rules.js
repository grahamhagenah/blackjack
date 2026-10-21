// Pure blackjack rules: no React, no timers, so they can be tested directly.

export const HAND_SIZE = 6;
export const STARTING_SCORE = 200;
export const SCORE_DELTA = 20;

const VALUES = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];

// One 52-card deck; suits don't matter to the game
export const createDeck = () => {
  const deck = [];
  for (let suit = 0; suit < 4; suit += 1) deck.push(...VALUES);
  return deck;
};

export const createEmptyHand = () => Array(HAND_SIZE).fill("");

export const drawRandomCard = (deck) => {
  const index = Math.floor(Math.random() * deck.length);
  const card = deck[index];
  const nextDeck = deck.slice(0, index).concat(deck.slice(index + 1));
  return { card, deck: nextDeck };
};

export const cardValue = (card) => {
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

// Aces count 11 until that would bust, then drop to 1 one at a time
export const calculateTotal = (hand) => {
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

// A natural blackjack: an Ace and a ten-card as the only two cards
export const isNatural = (hand) => {
  const cards = hand.filter(Boolean);
  return cards.length === 2 && calculateTotal(cards) === 21;
};

// Decide a hand after a card is drawn. `total` and `cardCount` are for the
// side that just drew; the dealer's result only counts once it reaches 17.
export const evaluateWinner = ({
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

// Points won or lost for a finished hand: blackjack pays 1.5x, a double 2x
export const scoreChange = ({ playerWins, push, natural }, { doubled = false } = {}) => {
  if (push) return 0;
  if (natural && playerWins) return SCORE_DELTA * 1.5;
  const stake = doubled ? SCORE_DELTA * 2 : SCORE_DELTA;
  return playerWins ? stake : -stake;
};
