import React from "react";

const Swap = ({ onClick, switchView, disabled = false }) => {
  const className = disabled ? "not-pushable" : "pushable";
  const handleClick = disabled ? undefined : onClick;

  return (
    <button
      id="swap"
      onClick={handleClick}
      className={className}
      disabled={disabled}
      aria-disabled={disabled}
    >
      <span className="front">View {switchView ? "Player" : "Dealer"}</span>
    </button>
  );
};

export default Swap;
