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
    expect(swapNote(base)).toBe("shows Q");
  });

  it("shows the player's total on View Player, also while the dealer draws", () => {
    expect(swapNote({ ...base, switchView: true })).toBe("shows 17");
    expect(
      swapNote({ ...base, switchView: true, playersTurn: false, dealerHand: hand("Q", 6) })
    ).toBe("shows 17");
  });

  it("shows nothing before the deal", () => {
    expect(swapNote({ ...base, dealerHand: hand(), playerTotal: 0 })).toBeNull();
    expect(
      swapNote({ ...base, switchView: true, dealerHand: hand(), playerTotal: 0 })
    ).toBeNull();
  });
});

describe("Swap", () => {
  it("puts the note on a second line of the button", () => {
    render(<Swap switchView={false} note="shows Q" onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("View Dealer");
    expect(button).toHaveTextContent("shows Q");
  });

  it("is just the label without a note", () => {
    render(<Swap switchView onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveTextContent(/^View Player$/);
  });
});
