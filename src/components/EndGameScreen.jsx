import React, { useState, useEffect } from "react";

const COUNT_DURATION_MS = 1000;

const EndGameScreen = ({
  playerTotal,
  dealerTotal,
  playerWins,
  blackjack,
  score,
  change,
  outOfPoints,
  onRestart,
}) => {
  // score is already the NEW score (after change applied)
  // oldScore is what it was before the win/loss
  const oldScore = score - change;
  const [displayScore, setDisplayScore] = useState(oldScore);

  useEffect(() => {
    // For push (change === 0), just show the score without animation
    if (change === 0) {
      setDisplayScore(score);
      return;
    }

    // Animate from old score to new score
    const step = change > 0 ? 1 : -1;
    const totalSteps = Math.abs(change);
    let currentStep = 0;

    setDisplayScore(oldScore);

    // Count over about a second, however large the change
    const interval = setInterval(() => {
      currentStep++;
      setDisplayScore(oldScore + (step * currentStep));

      if (currentStep >= totalSteps) {
        clearInterval(interval);
      }
    }, COUNT_DURATION_MS / totalSteps);

    return () => clearInterval(interval);
  }, [score, change, oldScore]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.code === "Space" ||
        event.key === " " ||
        event.code === "Enter" ||
        event.key === "Enter"
      ) {
        event.preventDefault();
        onRestart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRestart]);

  const tone = change === 0 ? "neutral" : playerWins ? "positive" : "negative";
  const outcome =
    change === 0 ? "Push" : blackjack ? "Blackjack!" : playerWins ? "You won" : "You lost";
  const delta = change > 0 ? `+${change}` : change < 0 ? `−${-change}` : "±0";

  return (
    <div className="end-game-screen">
      <div className="end-game-content">
        {/* 1. The result, then the hands that decided it */}
        <div className="end-game-headline">
          <h2 className="end-game-outcome">{outcome}</h2>
          <div className="end-game-totals">
            <span className="end-game-total">
              <span className="end-game-label">Dealer</span>
              <span className="end-game-value">{dealerTotal}</span>
            </span>
            <span className="end-game-vs">vs</span>
            <span className="end-game-total">
              <span className="end-game-label">Player</span>
              <span className="end-game-value">{playerTotal}</span>
            </span>
          </div>
        </div>

        {/* 2. Where the score stands now */}
        <div className="end-game-score-container">
          <div className="end-game-score-heading">
            <span className="end-game-score-label">Score</span>
            <span className={`end-game-delta ${tone}`}>{delta}</span>
          </div>
          <span className="end-game-score">{displayScore}</span>
          {outOfPoints && (
            <p className="end-game-note">Out of points.</p>
          )}
        </div>

        <button onClick={onRestart} className="pushable restart">
          <span className="front">{outOfPoints ? "New Game" : "Play Again"}</span>
        </button>
      </div>
    </div>
  );
};

export default EndGameScreen;
