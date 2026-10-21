import { act, renderHook } from "@testing-library/react";
import { DEAL_INTERVAL_MS, DEALING_DELAY_MS } from "../constants";
import { createDeck } from "../game/rules";
import useBlackjackGame from "./useBlackjackGame";

// Make the next draws come out as `cards`, in order. Mirrors the hook's
// deck so each Math.random() call picks the wanted card's position.
const rigDeck = (cards) => {
  const deck = createDeck();
  const queue = cards.slice();
  vi.spyOn(Math, "random").mockImplementation(() => {
    if (queue.length === 0) return 0;
    const index = deck.indexOf(queue.shift());
    const position = (index + 0.5) / deck.length;
    deck.splice(index, 1);
    return position;
  });
};

const startGame = () => {
  const deck = createDeck();
  return renderHook(() => useBlackjackGame(deck)).result;
};

const press = (game, action) => act(() => game.current[action]());

// Run the dealer's turn (or a double's pause) to the end
const runTimers = () =>
  act(() => vi.advanceTimersByTime(DEALING_DELAY_MS + DEAL_INTERVAL_MS * 8));

const cardsIn = (hand) => hand.filter(Boolean);

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useBlackjackGame", () => {
  it("deals one card per press, turning up the dealer's card on the first", () => {
    rigDeck([10, 6, 7]);
    const game = startGame();
    press(game, "deal");

    expect(cardsIn(game.current.playerHand)).toEqual([10]);
    expect(cardsIn(game.current.dealerHand)).toEqual([6]);
    expect(game.current.canDouble).toBe(false);

    press(game, "deal");
    expect(cardsIn(game.current.playerHand)).toEqual([10, 7]);
    expect(cardsIn(game.current.dealerHand)).toEqual([6]);
    expect(game.current.playerTotal).toBe(17);
    expect(game.current.canDouble).toBe(true);
    expect(game.current.gameOver).toBe(false);
  });

  it("waits for Stand on a blackjack, then pays +30", () => {
    rigDeck(["A", 6, "K", 9]);
    const game = startGame();
    press(game, "deal");
    press(game, "deal");

    // The hand waits: only Stand is offered
    runTimers();
    expect(game.current.gameOver).toBe(false);
    expect(game.current.playersTurn).toBe(true);
    expect(game.current.canStand).toBe(true);
    expect(game.current.canHit).toBe(false);
    expect(game.current.canDouble).toBe(false);

    // Hitting is ignored, so the blackjack can't be thrown away
    press(game, "deal");
    expect(cardsIn(game.current.playerHand)).toEqual(["A", "K"]);

    press(game, "stand");
    expect(game.current.gameOver).toBe(false);
    runTimers();
    expect(cardsIn(game.current.dealerHand)).toEqual([6, 9]);
    expect(game.current.gameOver).toBe(true);
    expect(game.current.blackjack).toBe(true);
    expect(game.current.change).toBe(30);
    expect(game.current.score).toBe(230);
  });

  it("pushes when both the player and the dealer have blackjack", () => {
    rigDeck(["A", "A", "K", "Q"]);
    const game = startGame();
    press(game, "deal");
    press(game, "deal");
    press(game, "stand");
    runTimers();

    expect(game.current.gameOver).toBe(true);
    expect(game.current.blackjack).toBe(false);
    expect(game.current.change).toBe(0);
    expect(game.current.score).toBe(200);
  });

  it("wins after standing when the dealer stops lower", () => {
    rigDeck([10, 10, 8, 7]);
    const game = startGame();
    press(game, "deal");
    press(game, "deal");
    press(game, "stand");
    runTimers();

    expect(cardsIn(game.current.dealerHand)).toEqual([10, 7]);
    expect(game.current.playerWins).toBe(true);
    expect(game.current.score).toBe(220);
  });

  it("pushes automatically when the totals tie", () => {
    rigDeck([10, 10, 8, 8]);
    const game = startGame();
    press(game, "deal");
    press(game, "deal");
    press(game, "stand");
    runTimers();

    expect(game.current.gameOver).toBe(true);
    expect(game.current.change).toBe(0);
  });

  it("loses 20 when the player busts", () => {
    rigDeck([10, 9, 6, "K"]);
    const game = startGame();
    press(game, "deal");
    press(game, "deal");
    press(game, "deal");

    expect(game.current.playerTotal).toBe(26);
    expect(game.current.gameOver).toBe(true);
    expect(game.current.score).toBe(180);
  });

  it("doubles: one card, a locked pause, then the dealer plays for ±40", () => {
    rigDeck([5, 10, 6, 10, 7]);
    const game = startGame();
    press(game, "deal");
    press(game, "deal");
    press(game, "double");

    expect(cardsIn(game.current.playerHand)).toEqual([5, 6, 10]);
    expect(game.current.locked).toBe(true);
    expect(game.current.canDouble).toBe(false);

    runTimers();
    expect(game.current.playerWins).toBe(true);
    expect(game.current.change).toBe(40);
  });

  it("doesn't let you stand on a single card", () => {
    rigDeck([10, 6, 7]);
    const game = startGame();
    press(game, "deal");

    expect(game.current.canStand).toBe(false);
    press(game, "stand");
    expect(game.current.playersTurn).toBe(true);

    press(game, "deal");
    expect(game.current.canStand).toBe(true);
    press(game, "stand");
    expect(game.current.playersTurn).toBe(false);
  });

  it("only lets you double on your first two cards", () => {
    rigDeck([2, 6, 3, 4]);
    const game = startGame();
    press(game, "deal");
    press(game, "deal");
    press(game, "deal");

    expect(game.current.canDouble).toBe(false);
    press(game, "double");
    expect(cardsIn(game.current.playerHand)).toHaveLength(3);
  });

  it("ends the dealer's turn with a six-card Charlie instead of hanging", () => {
    rigDeck([10, 2, 9, 2, 2, 2, 3, 3]);
    const game = startGame();
    press(game, "deal");
    press(game, "deal");
    press(game, "stand");
    runTimers();

    expect(cardsIn(game.current.dealerHand)).toHaveLength(6);
    expect(game.current.dealerTotal).toBe(14);
    expect(game.current.gameOver).toBe(true);
    expect(game.current.playerWins).toBe(false);
  });

  it("keeps the score between visits and ends the game at zero", () => {
    window.localStorage.setItem("retro-blackjack-score", "20");
    rigDeck([10, 10, 6, 10]);
    const game = startGame();
    expect(game.current.score).toBe(20);

    press(game, "deal");
    press(game, "deal");
    press(game, "stand");
    runTimers();
    expect(game.current.score).toBe(0);
    expect(game.current.outOfPoints).toBe(true);
    expect(window.localStorage.getItem("retro-blackjack-score")).toBe("0");

    press(game, "newGame");
    expect(game.current.score).toBe(200);
    expect(game.current.outOfPoints).toBe(false);
  });
});
