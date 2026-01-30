import React from "react";

const OutcomeBanner = ({ gameOver, playerWins }) => {
  return (
    <div
      id="outcome-banner"
      className={gameOver ? "show" : "hide"}
      aria-hidden={!gameOver}
    >
      {playerWins ? (
        <h3 id="outcome" className="outcome won">
          You <span className="blink">won.</span>
        </h3>
      ) : (
        <h3 id="outcome" className="outcome lost">
          You <span className="blink">lost.</span>
        </h3>
      )}
    </div>
  );
};

export default OutcomeBanner;
