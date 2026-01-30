import React from "react";

const Swap = ({ onClick, playersTurn }) => {
  return (
    <button id="swap" onClick={onClick} className="pushable">
      <span className="front">View {playersTurn ? "Dealer" : "Player"}</span>
    </button>
  );
};

export default Swap;
