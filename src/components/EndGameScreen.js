import React, { useState, useEffect } from "react";

const EndGameScreen = ({
  playerTotal,
  dealerTotal,
  playerWins,
  score,
  change,
  onRestart,
}) => {
  // score is already the NEW score (after change applied)
  // oldScore is what it was before the win/loss
  const oldScore = score - change;
  const [displayScore, setDisplayScore] = useState(oldScore);

  useEffect(() => {
    // Animate from old score to new score
    const step = change > 0 ? 1 : -1;
    const totalSteps = Math.abs(change);
    let currentStep = 0;

    setDisplayScore(oldScore);

    const interval = setInterval(() => {
      currentStep++;
      setDisplayScore(oldScore + (step * currentStep));

      if (currentStep >= totalSteps) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [score, change, oldScore]);

  return (
    <div className="end-game-screen">
      <div className="end-game-content">
        <div className="end-game-totals">
          <div className="end-game-total">
            <span className="end-game-label">Dealer</span>
            <span className="end-game-value">{dealerTotal}</span>
          </div>
          <div className="end-game-vs">vs</div>
          <div className="end-game-total">
            <span className="end-game-label">Player</span>
            <span className="end-game-value">{playerTotal}</span>
          </div>
        </div>

        <div className="end-game-result">
          <h2 className={`end-game-outcome ${change === 0 ? "push" : playerWins ? "won" : "lost"}`}>
            {change === 0 ? (
              <span className="blink">Push!</span>
            ) : (
              <>Player <span className="blink">{playerWins ? "won" : "lost"}.</span></>
            )}
          </h2>
          <div className={`end-game-score ${change === 0 ? "neutral" : playerWins ? "positive" : "negative"}`}>
            {displayScore}
          </div>
        </div>

        <button onClick={onRestart} className="pushable restart">
          <span className="front">Play Again</span>
        </button>
      </div>
    </div>
  );
};

export default EndGameScreen;
