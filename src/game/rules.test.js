import {
  HAND_SIZE,
  SCORE_DELTA,
  calculateTotal,
  createDeck,
  evaluateWinner,
  isNatural,
  scoreChange,
} from "./rules";

describe("createDeck", () => {
  it("has 52 cards, four of each value", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(deck.filter((card) => card === "A")).toHaveLength(4);
    expect(deck.filter((card) => card === "K")).toHaveLength(4);
  });
});

describe("calculateTotal", () => {
  it("counts face cards as 10", () => {
    expect(calculateTotal(["J", "Q"])).toBe(20);
    expect(calculateTotal(["K", 5])).toBe(15);
  });

  it("counts an Ace as 11 when it fits", () => {
    expect(calculateTotal(["A", 9])).toBe(20);
  });

  it("drops an Ace to 1 instead of busting", () => {
    expect(calculateTotal(["A", 9, 5])).toBe(15);
  });

  it("drops only as many Aces as needed", () => {
    expect(calculateTotal(["A", "A"])).toBe(12);
    expect(calculateTotal(["A", "A", 9])).toBe(21);
    expect(calculateTotal(["A", "A", "A", "K"])).toBe(13);
  });

  it("ignores empty slots", () => {
    expect(calculateTotal([10, 7, "", "", "", ""])).toBe(17);
  });
});

describe("isNatural", () => {
  it("is an Ace and a ten-card as the only two cards", () => {
    expect(isNatural(["A", "K", "", "", "", ""])).toBe(true);
    expect(isNatural([10, "A"])).toBe(true);
  });

  it("is not a 21 made from more than two cards", () => {
    expect(isNatural([7, 7, 7])).toBe(false);
    expect(isNatural(["A", 5, 5])).toBe(false);
  });

  it("is not two cards under 21", () => {
    expect(isNatural(["A", 9])).toBe(false);
  });
});

describe("evaluateWinner", () => {
  const player = (total, cardCount = 2) =>
    evaluateWinner({
      total,
      cardCount,
      dealersTurn: false,
      playerTotal: total,
      dealerTotal: 0,
    });
  const dealer = (dealerTotal, playerTotal, cardCount = 2) =>
    evaluateWinner({
      total: dealerTotal,
      cardCount,
      dealersTurn: true,
      playerTotal,
      dealerTotal,
    });

  it("keeps the hand going while the player is under 21", () => {
    expect(player(18).gameOver).toBe(false);
  });

  it("loses when the player busts", () => {
    expect(player(22)).toEqual({ gameOver: true, playerWins: false });
  });

  it("wins when the dealer busts", () => {
    expect(dealer(23, 15)).toEqual({ gameOver: true, playerWins: true });
  });

  it("keeps the dealer drawing below 17", () => {
    expect(dealer(16, 20).gameOver).toBe(false);
  });

  it("compares totals once the dealer reaches 17", () => {
    expect(dealer(17, 18)).toEqual({ gameOver: true, playerWins: true });
    expect(dealer(19, 18)).toEqual({ gameOver: true, playerWins: false });
  });

  it("pushes on equal totals", () => {
    expect(dealer(18, 18)).toEqual({
      gameOver: true,
      playerWins: false,
      push: true,
    });
  });

  it("gives a six-card Charlie to whoever fills the hand", () => {
    expect(player(19, HAND_SIZE)).toEqual({ gameOver: true, playerWins: true });
    expect(dealer(14, 20, HAND_SIZE)).toEqual({
      gameOver: true,
      playerWins: false,
    });
  });

  it("still busts a sixth card that goes over 21", () => {
    expect(player(24, HAND_SIZE)).toEqual({ gameOver: true, playerWins: false });
  });
});

describe("scoreChange", () => {
  it("is plus or minus the stake for a win or loss", () => {
    expect(scoreChange({ playerWins: true })).toBe(SCORE_DELTA);
    expect(scoreChange({ playerWins: false })).toBe(-SCORE_DELTA);
  });

  it("is zero for a push, even when doubled", () => {
    expect(scoreChange({ push: true }, { doubled: true })).toBe(0);
  });

  it("doubles the stake on a double", () => {
    expect(scoreChange({ playerWins: true }, { doubled: true })).toBe(40);
    expect(scoreChange({ playerWins: false }, { doubled: true })).toBe(-40);
  });

  it("pays 1.5x for a blackjack", () => {
    expect(scoreChange({ playerWins: true, natural: true })).toBe(30);
  });
});
