import React from "react";
import Swap from "./Swap";

const Controls = ({
  beginningState,
  gameOver,
  playersTurn,
  switchView,
  onHit,
  onStand,
  onRestart,
  onSwap,
}) => {
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
          <Swap onClick={onSwap} playersTurn={false} />
        </div>
      </div>
    );
  }

  if (!gameOver && playersTurn && switchView === false) {
    return (
      <div id="board-bottom">
        <div className="buttons">
          <button onClick={onHit} className="pushable">
            <span className="front">Hit</span>
          </button>
          <button onClick={onStand} className="pushable">
            <span className="front">Stand</span>
          </button>
          <Swap onClick={onSwap} playersTurn={true} />
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div id="board-bottom-gameover">
        <div className="end-actions">
          <button onClick={onRestart} className="pushable restart">
            <span className="front">Restart</span>
          </button>
          <Swap onClick={onSwap} playersTurn={!switchView} />
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
          <Swap onClick={onSwap} playersTurn={false} />
        </div>
      </div>
    );
  }

  if (!gameOver && !playersTurn) {
    return (
      <div id="board-bottom">
        <div className="buttons dealing">
          <h3 id="outcome">Dealing<span className="blink">...</span></h3>
        </div>
      </div>
    );
  }

  return null;
};

export default Controls;
