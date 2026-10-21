import React, { useCallback, useState, useEffect, useRef } from "react";
import "./App.css";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";
import Controls from "./components/Controls";
import Score from "./components/Score";
import Board from "./components/Board";
import EndGameScreen from "./components/EndGameScreen";
import HowToPlay from "./components/HowToPlay";
import swapNote from "./components/swapNote";
import useBlackjackGame from "./hooks/useBlackjackGame";
import { DEAL_INTERVAL_MS } from "./constants";

const App = ({ cards }) => {
  const [showRules, setShowRules] = useState(false);
  const closeRules = useCallback(() => setShowRules(false), []);
  const [showEndGameScreen, setShowEndGameScreen] = useState(false);
  const {
    beginningState,
    playerHand,
    dealerHand,
    playerTotal,
    dealerTotal,
    nextDealerIndex,
    playersTurn,
    gameOver,
    playerWins,
    score,
    change,
    muted,
    switchView,
    locked,
    blackjack,
    canStand,
    canDouble,
    deal,
    stand,
    double,
    clearState,
    newGame,
    outOfPoints,
    switchHandView,
    toggleMuted,
    playEndGameSound,
    playDealingSound,
  } = useBlackjackGame(cards);
  const lastEndGameSoundRef = useRef(null);

  // Delay showing the end game screen so player can see the final result
  useEffect(() => {
    if (gameOver) {
      const timer = setTimeout(() => {
        setShowEndGameScreen(true);
      }, DEAL_INTERVAL_MS);
      return () => clearTimeout(timer);
    } else {
      setShowEndGameScreen(false);
    }
  }, [gameOver]);

  useEffect(() => {
    if (!showEndGameScreen || !gameOver || change === 0) return;
    const soundKey = `${playerWins}-${score}-${change}`;
    if (lastEndGameSoundRef.current === soundKey) return;
    playEndGameSound(playerWins);
    lastEndGameSoundRef.current = soundKey;
  }, [showEndGameScreen, gameOver, change, playerWins, score, playEndGameSound]);

  useEffect(() => {
    if (!showEndGameScreen) {
      lastEndGameSoundRef.current = null;
    }
  }, [showEndGameScreen]);

  return (
    <>
      {showEndGameScreen ? (
        <EndGameScreen
          playerTotal={playerTotal}
          dealerTotal={dealerTotal}
          playerWins={playerWins}
          blackjack={blackjack}
          score={score}
          change={change}
          outOfPoints={outOfPoints}
          onRestart={outOfPoints ? newGame : clearState}
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
              dealerCardCount={nextDealerIndex}
              gameOver={gameOver}
              canStand={canStand}
              canDouble={canDouble}
              locked={locked}
              onHit={deal}
              onStand={stand}
              onDouble={double}
              onSwap={switchHandView}
              onDealingShown={playDealingSound}
              swapNote={swapNote({ switchView, playersTurn, dealerHand, playerTotal })}
            />
          </div>
        </>
      )}
      {showRules && <HowToPlay onClose={closeRules} />}
    </>
  );
};

export default App
