import React from "react";

const Swap = ({ onClick, switchView }) => {
  return (
    <button id="swap" onClick={onClick} className="pushable">
      <span className="front">View {switchView ? "Player" : "Dealer"}</span>
    </button>
  );
};

export default Swap;
