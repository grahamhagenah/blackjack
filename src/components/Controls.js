import React, { useState, useEffect, useRef } from "react";
import Swap from "./Swap";

const Controls = ({
  beginningState,
  playersTurn,
  switchView,
  playerTotal,
  dealerTotal,
  dealerCardCount,
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
  const [dealingDots, setDealingDots] = useState(0);
  const [isHitPressed, setIsHitPressed] = useState(false);
  const prevPlayersTurnRef = useRef(playersTurn);
  const dealingBaseIndexRef = useRef(dealerCardCount);

  // Handle player stand transition (player's turn -> dealer's turn)
  useEffect(() => {
    if (!playersTurn && prevPlayersTurnRef.current && !gameOver) {
      // Player just stood - fade out buttons, then show dealing
      setIsFadingToDealing(true);
      dealingBaseIndexRef.current = dealerCardCount;
      setDealingDots(0);
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
      setDealingDots(0);
      prevPlayersTurnRef.current = playersTurn;
    }
  }, [playersTurn, gameOver, dealerCardCount]);

  useEffect(() => {
    if (playersTurn || !showDealing) return;
    const nextDots = Math.max(
      0,
      dealerCardCount - dealingBaseIndexRef.current
    );
    setDealingDots(nextDots);
  }, [dealerCardCount, playersTurn, showDealing]);

  useEffect(() => {
    const canHit =
      !gameOver &&
      (beginningState || (playersTurn && switchView === false));
    const canStand = !gameOver && playersTurn && switchView === false;
    const canSwap = !gameOver && !beginningState;

    if (!canHit) {
      setIsHitPressed(false);
    }

    const handleKeyDown = (event) => {
      const key = event.key?.toLowerCase();

      if (
        event.code === "Space" ||
        event.key === " " ||
        event.code === "Enter" ||
        event.key === "Enter"
      ) {
        if (event.repeat || !canHit) return;
        event.preventDefault();
        setIsHitPressed(true);
        onHit();
        return;
      }

      if (key === "s") {
        if (event.repeat || !canStand) return;
        event.preventDefault();
        onStand();
        return;
      }

      if (key === "v") {
        if (event.repeat || !canSwap) return;
        event.preventDefault();
        onSwap();
      }
    };

    const handleKeyUp = (event) => {
      if (
        event.code === "Space" ||
        event.key === " " ||
        event.code === "Enter" ||
        event.key === "Enter"
      ) {
        event.preventDefault();
        setIsHitPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    beginningState,
    gameOver,
    onHit,
    onStand,
    onSwap,
    playersTurn,
    switchView,
  ]);

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
          <div className="outcome-box bust blink">
            <span className="outcome-text">Busted!</span>
          </div>
        </div>
      </div>
    );
  }

  // Dealer busted - show dealer bust message
  if (showDealerBust) {
    return (
      <div id="board-bottom">
        <div className="buttons dealing">
          <div className="outcome-box dealer-bust blink">
            <span className="outcome-text">Dealer busted!</span>
          </div>
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
          <button
            onClick={onHit}
            className={`pushable ${isHitPressed ? "is-pressed" : ""}`}
          >
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
          <h3 id="outcome" className="blink">
            Dealing{".".repeat(dealingDots)}
          </h3>
        </div>
      </div>
    );
  }

  if (playersTurn && switchView === false) {
    return (
      <div id="board-bottom">
        <div className="buttons">
          <button
            onClick={onHit}
            className={`pushable ${isHitPressed ? "is-pressed" : ""}`}
          >
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
