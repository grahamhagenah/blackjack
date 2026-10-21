import React, { useState, useEffect, useRef } from "react";
import Swap from "./Swap";
import { DEALING_DELAY_MS } from "../constants";

const Controls = ({
  beginningState,
  playersTurn,
  switchView,
  playerTotal,
  dealerTotal,
  dealerCardCount,
  gameOver,
  canHit,
  canStand,
  canDouble,
  locked,
  onHit,
  onStand,
  onDouble,
  onSwap,
  onDealingShown,
  swapNote,
}) => {
  const [showDealing, setShowDealing] = useState(false);
  const [isFadingToDealing, setIsFadingToDealing] = useState(false);
  const [showPlayerBust, setShowPlayerBust] = useState(false);
  const [showDealerBust, setShowDealerBust] = useState(false);
  const [dealingDots, setDealingDots] = useState(0);
  const [isHitPressed, setIsHitPressed] = useState(false);
  const prevPlayersTurnRef = useRef(playersTurn);
  const dealingBaseIndexRef = useRef(dealerCardCount);
  const onDealingShownRef = useRef(onDealingShown);
  onDealingShownRef.current = onDealingShown;

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
        onDealingShownRef.current();
      }, DEALING_DELAY_MS);
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
    const hitAllowed =
      beginningState || (canHit && switchView === false);
    const standAllowed = canStand && switchView === false;
    const canSwap = !gameOver && !beginningState;

    if (!hitAllowed) {
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
        if (event.repeat || !hitAllowed) return;
        event.preventDefault();
        setIsHitPressed(true);
        onHit();
        return;
      }

      if (key === "s") {
        if (event.repeat || !standAllowed) return;
        event.preventDefault();
        onStand();
        return;
      }

      if (key === "d") {
        if (event.repeat || !canDouble || switchView) return;
        event.preventDefault();
        onDouble();
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
    canHit,
    canStand,
    canDouble,
    locked,
    gameOver,
    onHit,
    onStand,
    onDouble,
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

  const doubleButton = (enabled) => (
    <button
      id="double"
      onClick={enabled ? onDouble : undefined}
      className={enabled ? "pushable" : "not-pushable"}
    >
      <span className="front">Double</span>
    </button>
  );

  // A message ("Dealing", "Busted!") shown over an invisible copy of the
  // buttons, so the controls area keeps exactly the same size and nothing
  // above it moves
  const withMessage = (message, { blink = false, fadeIn = false } = {}) => (
    <div id="board-bottom">
      <div className="buttons placeholder" aria-hidden="true">
        <button className="not-pushable" disabled>
          <span className="front">Hit</span>
        </button>
        <button className="not-pushable" disabled>
          <span className="front">Stand</span>
        </button>
        <button id="double" className="not-pushable" disabled>
          <span className="front">Double</span>
        </button>
        <Swap switchView={switchView} disabled />
      </div>
      <div className={`buttons dealing message${fadeIn ? " fading-in" : ""}`}>
        <h3 id="outcome" className={blink ? "blink" : undefined}>
          {message}
        </h3>
      </div>
    </div>
  );

  if (showPlayerBust) return withMessage("Busted!", { blink: true });

  if (showDealerBust) return withMessage("Dealer busted!", { blink: true });

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
          {doubleButton(false)}
          <Swap onClick={onSwap} switchView={switchView} note={swapNote} />
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
            <span className="front">Deal</span>
          </button>
          <button className="not-pushable">
            <span className="front">Stand</span>
          </button>
          {doubleButton(false)}
          <Swap onClick={onSwap} switchView={switchView} note={swapNote} disabled />
        </div>
      </div>
    );
  }

  // Dealer's turn - show "Dealing..."
  if (!playersTurn && showDealing) {
    return withMessage(`Dealing${".".repeat(dealingDots)}`, { fadeIn: true });
  }

  // Locked while a double or a blackjack plays out
  if (playersTurn && locked) {
    return (
      <div id="board-bottom">
        <div className="buttons">
          <button className="not-pushable">
            <span className="front">Hit</span>
          </button>
          <button className="not-pushable">
            <span className="front">Stand</span>
          </button>
          {doubleButton(false)}
          <Swap onClick={onSwap} switchView={switchView} note={swapNote} disabled />
        </div>
      </div>
    );
  }

  if (playersTurn && switchView === false) {
    return (
      <div id="board-bottom">
        <div className="buttons">
          <button
            onClick={canHit ? onHit : undefined}
            className={
              canHit ? `pushable ${isHitPressed ? "is-pressed" : ""}` : "not-pushable"
            }
          >
            <span className="front">Hit</span>
          </button>
          <button
            onClick={canStand ? onStand : undefined}
            className={canStand ? "pushable" : "not-pushable"}
          >
            <span className="front">Stand</span>
          </button>
          {doubleButton(canDouble)}
          <Swap onClick={onSwap} switchView={switchView} note={swapNote} />
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
          {doubleButton(false)}
          <Swap onClick={onSwap} switchView={switchView} note={swapNote} />
        </div>
      </div>
    );
  }

  return null;
};

export default Controls;
