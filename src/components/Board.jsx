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
  // The dealer's face-up card, shown on the player's board while deciding
  const upcard = dealerHand[0];
  const dealerNote = playersTurn && upcard ? `Dealer shows ${upcard}` : null;
  // The player's total, shown on the dealer's board (also while the dealer draws)
  const playerNote = playerTotal > 0 ? `Player shows ${playerTotal}` : null;

  return (
    <div className="board">
      {showPlayer ? (
        <Hand
          key="player"
          name="Player"
          note={dealerNote}
          hand={playerHand}
          total={playerTotal}
          playersTurn={playersTurn}
        />
      ) : (
        <Hand
          key="dealer"
          name="Dealer"
          note={playerNote}
          hand={dealerHand}
          total={dealerTotal}
          playersTurn={playersTurn}
        />
      )}
    </div>
  );
};

export default Board;
