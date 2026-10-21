import { render, screen } from "@testing-library/react";
import Board from "./Board";

const hand = (...cards) => [...cards, ...Array(6 - cards.length).fill("")];

const renderBoard = (props) =>
  render(
    <Board
      playersTurn
      switchView={false}
      playerHand={hand(10, 7)}
      playerTotal={17}
      dealerHand={hand("Q")}
      dealerTotal={10}
      {...props}
    />
  );

describe("Board notes", () => {
  it("shows the dealer's face-up card on the player's board", () => {
    renderBoard();
    expect(screen.getByText("Dealer shows Q")).toBeInTheDocument();
  });

  it("shows the player's total on the dealer's board", () => {
    renderBoard({ switchView: true });
    expect(screen.getByText("Player shows 17")).toBeInTheDocument();
  });

  it("keeps the player's total on the dealer's board while the dealer draws", () => {
    renderBoard({ switchView: true, playersTurn: false, dealerHand: hand("Q", 6) });
    expect(screen.getByText("Player shows 17")).toBeInTheDocument();
  });

  it("shows no notes before the deal", () => {
    renderBoard({ playerHand: hand(), playerTotal: 0, dealerHand: hand(), dealerTotal: 0 });
    expect(screen.queryByText(/shows/)).not.toBeInTheDocument();
  });
});
