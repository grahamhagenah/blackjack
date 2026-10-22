import { HAND_SIZE, calculateTotal, cardValue, isNatural } from "./rules";

// How many Aces are counted as 1 to keep the hand at 21 or under
const lowAceCount = (cards) => {
  const aces = cards.filter((card) => card === "A").length;
  const hardTotal = cards.reduce(
    (sum, card) => sum + (card === "A" ? 1 : cardValue(card)),
    0
  );
  // Every Ace starts as 1 here; each one that can be 11 without busting is
  const highAces = Math.min(aces, Math.max(0, Math.floor((21 - hardTotal) / 10)));
  return aces - highAces;
};

const FACE_CARDS = { A: "Ace!", K: "King!", Q: "Queen!", J: "Jack!" };

// The word that floats up when a card lands in the player's hand, or null.
// Only the most important thing is said, and the same situation always
// gets the same word.
export const cardCallout = (prevHand, hand) => {
  const before = prevHand.filter(Boolean);
  const cards = hand.filter(Boolean);
  if (cards.length <= before.length) return null;

  const card = cards[cards.length - 1];
  const total = calculateTotal(cards);
  const prevTotal = calculateTotal(before);

  if (isNatural(cards)) return "Blackjack!";
  if (cards.length === HAND_SIZE && total <= 21) return "Charlie!";
  // The "Busted!" message below says the rest
  if (total > 21) return "Oof!";
  if (cards.length === 3 && cards.every((c) => c === 7)) return "Lucky 7s!";
  if (total === 21 && prevTotal !== 21) return "21!";
  // Explains a total that just went down instead of up
  if (lowAceCount(cards) > lowAceCount(before)) return "Ace → 1";
  if (cards.length === HAND_SIZE - 1) return "1 more = Charlie";
  return FACE_CARDS[card] ?? null;
};
