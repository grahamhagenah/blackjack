import React from "react";
import Hand from "./Hand";

const Board = ({
  playersTurn,
  switchView,
  playerHand,
  playerTotal,
  dealerHand,
  dealerTotal,
}) => {
  const showPlayer = !switchView;

  return (
    <div className="board">
      {showPlayer ? (
        <Hand name="Player" hand={playerHand} total={playerTotal} />
      ) : (
        <Hand name="Dealer" hand={dealerHand} total={dealerTotal} />
      )}
    </div>
  );
};

export default Board;
