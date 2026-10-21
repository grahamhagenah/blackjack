import React from "react";

const Swap = ({ onClick, switchView, disabled = false, note }) => {
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
      <span className="front">
        View {switchView ? "Player" : "Dealer"}
        {/* Always present so the button keeps one width, value or not */}
        <span className="swap-note">{note ? ` · ${note}` : ""}</span>
      </span>
    </button>
  );
};

export default Swap;
