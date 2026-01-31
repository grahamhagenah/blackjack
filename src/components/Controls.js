import React, { useState, useEffect, useRef } from "react";
import Swap from "./Swap";

const Controls = ({
  beginningState,
  playersTurn,
  switchView,
  playerTotal,
  dealerTotal,
  gameOver,
  onHit,
  onStand,
  onPush,
  onSwap,
}) => {
  const canPush = playerTotal === dealerTotal && playerTotal <= 21;
  const [showDealing, setShowDealing] = useState(false);
  const [isFadingToDealing, setIsFadingToDealing] = useState(false);
  const [showPlayerBust, setShowPlayerBust] = useState(false);
  const [showDealerBust, setShowDealerBust] = useState(false);
  const prevPlayersTurnRef = useRef(playersTurn);

  // Handle player stand transition (player's turn -> dealer's turn)
  useEffect(() => {
    if (!playersTurn && prevPlayersTurnRef.current && !gameOver) {
      // Player just stood - fade out buttons, then show dealing
      setIsFadingToDealing(true);
      const timer = setTimeout(() => {
        setIsFadingToDealing(false);
        setShowDealing(true);
      }, 300);
      prevPlayersTurnRef.current = playersTurn;
      return () => clearTimeout(timer);
    } else if (playersTurn && !prevPlayersTurnRef.current) {
      // Back to player's turn (new game)
      setShowDealing(false);
      setIsFadingToDealing(false);
      setShowPlayerBust(false);
      setShowDealerBust(false);
      prevPlayersTurnRef.current = playersTurn;
    }
  }, [playersTurn, gameOver]);

  // Handle player bust
  useEffect(() => {
    if (gameOver && playerTotal > 21) {
      setShowPlayerBust(true);
    } else if (!gameOver) {
      setShowPlayerBust(false);
    }
  }, [gameOver, playerTotal]);

  // Handle dealer bust
  useEffect(() => {
    if (gameOver && dealerTotal > 21 && playerTotal <= 21) {
      setShowDealerBust(true);
    } else if (!gameOver) {
      setShowDealerBust(false);
    }
  }, [gameOver, dealerTotal, playerTotal]);

  const justStood = !playersTurn && prevPlayersTurnRef.current && !gameOver;

  // Player busted - show bust message
  if (showPlayerBust) {
    return (
      <div id="board-bottom">
        <div className="buttons dealing">
          <h3 id="outcome" className="blink bust">Bust!</h3>
        </div>
      </div>
    );
  }

  // Dealer busted - show dealer bust message
  if (showDealerBust) {
    return (
      <div id="board-bottom">
        <div className="buttons dealing">
          <h3 id="outcome" className="blink dealer-bust">Dealer busted!</h3>
        </div>
      </div>
    );
  }

  // During fade-out to dealing
  if (isFadingToDealing || justStood) {
    return (
      <div id="board-bottom">
        <div className="buttons fading-out">
          <button className="not-pushable">
            <span className="front">Hit</span>
          </button>
          <button className="not-pushable">
            <span className="front">Stand</span>
          </button>
          <Swap onClick={onSwap} switchView={switchView} />
        </div>
      </div>
    );
  }

  if (beginningState) {
    return (
      <div id="board-bottom">
        <div className="buttons">
          <button onClick={onHit} className="pushable">
            <span className="front">Hit</span>
          </button>
          <button className="not-pushable">
            <span className="front">Stand</span>
          </button>
          <Swap onClick={onSwap} switchView={switchView} disabled />
        </div>
      </div>
    );
  }

  // Dealer's turn - show "Dealing..."
  if (!playersTurn && showDealing) {
    return (
      <div id="board-bottom">
        <div className="buttons dealing fading-in">
          <h3 id="outcome" className="blink">Dealing...</h3>
        </div>
      </div>
    );
  }

  if (playersTurn && switchView === false) {
    return (
      <div id="board-bottom">
        <div className="buttons">
          <button onClick={onHit} className="pushable">
            <span className="front">Hit</span>
          </button>
          {canPush ? (
            <button onClick={onPush} className="pushable">
              <span className="front">Push</span>
            </button>
          ) : (
            <button onClick={onStand} className="pushable">
              <span className="front">Stand</span>
            </button>
          )}
          <Swap onClick={onSwap} switchView={switchView} />
        </div>
      </div>
    );
  }

  if (switchView === true) {
    return (
      <div id="board-bottom">
        <div className="buttons">
          <button className="not-pushable">
            <span className="front">Hit</span>
          </button>
          <button className="not-pushable">
            <span className="front">Stand</span>
          </button>
          <Swap onClick={onSwap} switchView={switchView} />
        </div>
      </div>
    );
  }

  return null;
};

export default Controls;
