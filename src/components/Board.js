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
        <Hand
          name="Player"
          hand={playerHand}
          total={playerTotal}
          playersTurn={playersTurn}
        />
      ) : (
        <Hand
          name="Dealer"
          hand={dealerHand}
          total={dealerTotal}
          playersTurn={playersTurn}
        />
      )}
    </div>
  );
};

export default Board;
