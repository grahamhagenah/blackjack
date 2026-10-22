import { cardCallout } from "./callouts";

// The word shown when the last card in `cards` is dealt
const dealt = (...cards) => cardCallout(cards.slice(0, -1), cards);

describe("cardCallout", () => {
  it("calls a two-card 21 a blackjack", () => {
    expect(dealt("A", "K")).toBe("Blackjack!");
    expect(dealt(10, "A")).toBe("Blackjack!");
  });

  it("calls six cards without busting a Charlie", () => {
    expect(dealt(2, 2, 3, 3, 4, 2)).toBe("Charlie!");
  });

  it("says Oof! on a bust, even when the card is a King", () => {
    expect(dealt(10, 6, "K")).toBe("Oof!");
  });

  it("celebrates three 7s", () => {
    expect(dealt(7, 7, 7)).toBe("Lucky 7s!");
  });

  it("calls out any other 21", () => {
    expect(dealt(5, 6, "Q")).toBe("21!");
  });

  it("explains an Ace dropping to 1 when the total goes down", () => {
    // A + 5 = 16, then a 9 would bust unless the Ace counts as 1 (15)
    expect(dealt("A", 5, 9)).toBe("Ace → 1");
  });

  it("hints at Charlie on the fifth card", () => {
    expect(dealt(2, 3, 2, 3, 4)).toBe("1 more = Charlie");
  });

  it("names Aces and face cards", () => {
    expect(dealt(2, "A")).toBe("Ace!");
    expect(dealt(2, "K")).toBe("King!");
    expect(dealt(2, "Q")).toBe("Queen!");
    expect(dealt(2, "J")).toBe("Jack!");
  });

  it("stays quiet for ordinary number cards", () => {
    expect(dealt(2, 7)).toBeNull();
    expect(dealt(9, 9)).toBeNull();
  });

  it("says nothing when no new card arrived", () => {
    expect(cardCallout(["A", "K"], ["A", "K"])).toBeNull();
  });

  it("no longer uses the old, unclear words", () => {
    const words = [
      dealt(9, 9),
      dealt(9, 9, 2),
      dealt("J", 3),
      dealt("K", 3),
      dealt(10, 6, "K"),
    ];
    for (const old of ["Again!", "Pair!", "Haha", "Your Majesty", "Nice!", "Bust!"]) {
      expect(words).not.toContain(old);
    }
  });
});
