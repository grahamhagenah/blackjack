import React, { useState } from "react";
import "./App.css";
import { Helmet } from "react-helmet";
import Controls from "./components/Controls";
import Score from "./components/Score";
import Board from "./components/Board";
import OutcomeBanner from "./components/OutcomeBanner";
import useBlackjackGame from "./hooks/useBlackjackGame";

const App = ({ cards }) => {
  const [showRules, setShowRules] = useState(false);
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
    switchView,
    deal,
    stand,
    clearState,
    switchHandView,
  } = useBlackjackGame(cards);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Retro Blackjack</title>
        <meta name="theme-color" content="#DBDBDB"></meta>
      </Helmet>
      <Score score={score} change={change} />
      <button
        className="help-button"
        onClick={() => setShowRules(true)}
        aria-label="Show rules"
      >
        <span className="front">?</span>
      </button>
      <div id="game-area">
        <OutcomeBanner gameOver={gameOver} playerWins={playerWins} />
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
          gameOver={gameOver}
          playersTurn={playersTurn}
          switchView={switchView}
          onHit={deal}
          onStand={stand}
          onRestart={clearState}
          onSwap={switchHandView}
        />
      </div>
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
              <button
                className="pushable modal-close"
                onClick={() => setShowRules(false)}
              >
                <span className="front">Close</span>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Draw cards to reach 21 without going over. Face cards are worth
                10, Aces are worth 11 (and drop to 1 if you’d bust).
              </p>
              <p>
                Hit to take a card. Stand to end your turn—then the dealer draws
                until their total is at least 17.
              </p>
              <p>
                If you bust, you lose. If the dealer busts, you win. Otherwise,
                the higher total wins.
              </p>
              <p className="modal-note">
                Use “View Dealer / View Player” to toggle the board view at any
                time.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App
