import { render, screen } from "@testing-library/react";
import Swap from "./Swap";
import swapNote from "./swapNote";

const hand = (...cards) => [...cards, ...Array(6 - cards.length).fill("")];

describe("swapNote", () => {
  const base = {
    switchView: false,
    playersTurn: true,
    dealerHand: hand("Q"),
    playerTotal: 17,
  };

  it("shows the dealer's face-up card on View Dealer", () => {
    expect(swapNote(base)).toBe("Q");
  });

  it("shows the player's total on View Player, also while the dealer draws", () => {
    expect(swapNote({ ...base, switchView: true })).toBe("17");
    expect(
      swapNote({ ...base, switchView: true, playersTurn: false, dealerHand: hand("Q", 6) })
    ).toBe("17");
  });

  it("shows nothing before the deal", () => {
    expect(swapNote({ ...base, dealerHand: hand(), playerTotal: 0 })).toBeNull();
    expect(
      swapNote({ ...base, switchView: true, dealerHand: hand(), playerTotal: 0 })
    ).toBeNull();
  });
});

describe("Swap", () => {
  it("puts the note after the label on the same line", () => {
    render(<Swap switchView={false} note="Q" onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveTextContent("View Dealer: Q");
  });

  it("is just the label without a note", () => {
    render(<Swap switchView onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveTextContent(/^View Player$/);
  });
});
