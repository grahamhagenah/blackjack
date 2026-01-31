import React, { useState, useEffect } from "react";
import "./App.css";
import { Helmet } from "react-helmet";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";
import Controls from "./components/Controls";
import Score from "./components/Score";
import Board from "./components/Board";
import EndGameScreen from "./components/EndGameScreen";
import useBlackjackGame from "./hooks/useBlackjackGame";

const App = ({ cards }) => {
  const [showRules, setShowRules] = useState(false);
  const [showEndGameScreen, setShowEndGameScreen] = useState(false);
  const {
    beginningState,
    playerHand,
    dealerHand,
    playerTotal,
    dealerTotal,
    playersTurn,
    gameOver,
    playerWins,
    score,
    change,
    muted,
    switchView,
    deal,
    stand,
    push,
    clearState,
    switchHandView,
    toggleMuted,
  } = useBlackjackGame(cards);

  // Delay showing the end game screen so player can see the final result
  // Skip delay for push (change === 0)
  useEffect(() => {
    if (gameOver) {
      if (change === 0) {
        // Push - show end game immediately
        setShowEndGameScreen(true);
      } else {
        // Win/loss - delay to show result
        const timer = setTimeout(() => {
          setShowEndGameScreen(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      setShowEndGameScreen(false);
    }
  }, [gameOver, change]);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Retro Blackjack</title>
        <meta name="theme-color" content="#DBDBDB"></meta>
      </Helmet>
      {showEndGameScreen ? (
        <EndGameScreen
          playerTotal={playerTotal}
          dealerTotal={dealerTotal}
          playerWins={playerWins}
          score={score}
          change={change}
          onRestart={clearState}
        />
      ) : (
        <>
          <div className="top-bar">
            <Score score={gameOver ? score - change : score} change={0} />
            <div className="help-controls">
              <button
                className="pushable help-button"
                onClick={() => setShowRules(true)}
                aria-label="Show rules"
              >
                <span className="front">?</span>
              </button>
              <button
                className="pushable help-button mute-button"
                onClick={toggleMuted}
                aria-pressed={muted}
                aria-label={muted ? "Unmute sounds" : "Mute sounds"}
              >
                <span className="front">
                  {muted ? (
                    <SpeakerXMarkIcon aria-hidden="true" />
                  ) : (
                    <SpeakerWaveIcon aria-hidden="true" />
                  )}
                </span>
              </button>
            </div>
          </div>
          <div id="game-area">
            <Board
              playersTurn={playersTurn}
              playerHand={playerHand}
              playerTotal={playerTotal}
              dealerHand={dealerHand}
              dealerTotal={dealerTotal}
              switchView={switchView}
            />
            <Controls
              beginningState={beginningState}
              playersTurn={playersTurn}
              switchView={switchView}
              playerTotal={playerTotal}
              dealerTotal={dealerTotal}
              gameOver={gameOver}
              onHit={deal}
              onStand={stand}
              onPush={push}
              onSwap={switchHandView}
            />
          </div>
        </>
      )}
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>How to Play</h2>
            </div>
            <div className="modal-body">
              <ol className="modal-list">
                <li>
                  Draw cards to reach 21 without going over. Face cards are
                  worth 10, Aces are worth 11 (and drop to 1 if you'd bust).
                </li>
                <li>
                  Hit to take a card. Stand to end your turn—then the dealer
                  draws until their total is at least 17.
                </li>
                <li>
                  If you bust, you lose. If the dealer busts, you win.
                  Otherwise, the higher total wins.
                </li>
                <li>
                  If your total equals the dealer's, you can Push to end the
                  game as a tie with no score change.
                </li>
              </ol>
              <p className="modal-tip">
                Tip: Use “View Dealer / View Player” to toggle the board view at
                any time.
              </p>
              <div className="modal-actions">
                <button
                  className="pushable modal-close"
                  onClick={() => setShowRules(false)}
                >
                  <span className="front">Got it</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App
