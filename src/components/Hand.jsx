import React, { useEffect, useRef, useState } from "react";
import { cardCallout } from "../game/callouts";

const getLowAceIndexes = (hand) => {
  let sum = 0;
  const aceIndexes = [];

  for (let i = 0; i < hand.length; i += 1) {
    const card = hand[i];
    if (!card) continue;
    if (card === "A") {
      sum += 11;
      aceIndexes.push(i);
    } else if (isNaN(card)) {
      sum += 10;
    } else {
      sum += Number(card);
    }
  }

  const reduced = new Set();
  let reduceIndex = 0;
  while (sum > 21 && reduceIndex < aceIndexes.length) {
    sum -= 10;
    reduced.add(aceIndexes[reduceIndex]);
    reduceIndex += 1;
  }

  return reduced;
};

// Board outline drawn like the handheld's LCD: only the corners and the
// joins between cards are lit, leaving a gap along the middle of each edge.
// Units are one card = 100; the grid is 5 cards wide and 2 tall.
const ARM = 30;
const RADIUS = 14;

const corner = (x, y, dx, dy) =>
  `M${x + dx * ARM} ${y}L${x + dx * RADIUS} ${y}` +
  `Q${x} ${y} ${x} ${y + dy * RADIUS}L${x} ${y + dy * ARM}`;

const join = (x, y, arms) =>
  arms.map(([dx, dy]) => `M${x} ${y}L${x + dx * ARM} ${y + dy * ARM}`).join("");

const UP = [0, -1];
const DOWN = [0, 1];
const LEFT = [-1, 0];
const RIGHT = [1, 0];

const BOARD_LINES = [
  corner(0, 0, 1, 1),
  corner(100, 0, -1, 1),
  corner(500, 100, -1, 1),
  corner(0, 200, 1, -1),
  corner(500, 200, -1, -1),
  join(0, 100, [UP, DOWN, RIGHT]),
  join(100, 100, [UP, DOWN, LEFT, RIGHT]),
  ...[200, 300, 400].map((x) => join(x, 100, [LEFT, RIGHT, DOWN])),
  ...[100, 200, 300, 400].map((x) => join(x, 200, [LEFT, RIGHT, UP])),
].join("");

// How long a text effect like "Blackjack!" stays on screen
const BURST_DURATION_MS = 2400;

const Hand = ({ name, hand, total, playersTurn }) => {
  const lowAces = getLowAceIndexes(hand);
  const [bursts, setBursts] = useState([]);
  const prevHandRef = useRef(hand);
  const burstIdRef = useRef(0);

  useEffect(() => {
    if (!playersTurn) {
      prevHandRef.current = hand;
      return;
    }
    const prevHand = prevHandRef.current;
    // Only a newly dealt card gets a word; a hand coming back into view doesn't
    const word = cardCallout(prevHand, hand);

    if (word) {
      const id = burstIdRef.current++;
      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 760px)").matches;
      // On phones the total sits by the right edge, so center the word to its left
      const offsetX = isMobile
        ? -60 + (Math.random() * 12 - 6)
        : (Math.random() < 0.5 ? -1 : 1) *
          (24 + Math.floor(Math.random() * 30));
      const offsetY = -56 - Math.floor(Math.random() * 24);
      // Slight sideways drift while floating up; leftward on phones to stay on screen
      const driftX = isMobile
        ? -6 - Math.floor(Math.random() * 8)
        : (Math.random() < 0.5 ? -1 : 1) * (6 + Math.floor(Math.random() * 8));
      setBursts((prev) => [
        ...prev,
        { id, word, offsetX, offsetY, driftX },
      ]);
      const timer = setTimeout(() => {
        setBursts((prev) => prev.filter((burst) => burst.id !== id));
      }, BURST_DURATION_MS);
      prevHandRef.current = hand;
      return () => clearTimeout(timer);
    }

    prevHandRef.current = hand;
  }, [hand, playersTurn]);

  const renderCardValue = (card, index) => {
    const isLowAce = card === "A" && lowAces.has(index);
    return (
      <>
        {card || "0"}
        {isLowAce ? <span className="ace-indicator">↓1</span> : null}
      </>
    );
  };

  return (
    <div className="hand">
      <ul className="hand-grid">
        <svg
          className="board-lines"
          viewBox="0 0 500 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={BOARD_LINES} />
        </svg>
        <li className="card-cell">
          <div className={`card-value ${hand[0] ? "" : "is-hidden"}`}>
            {renderCardValue(hand[0], 0)}
          </div>
        </li>
        <li className="name">{name}</li>
        <li className="spacer"></li>
        <li className="spacer"></li>
        <li className="total">
          <span className={`total-value ${total > 0 ? "" : "is-hidden"}`}>
            {total > 0 ? total : "0"}
          </span>
          {bursts.map((burst) => (
            <span
              key={burst.id}
              className="total-burst"
              style={{
                left: `calc(50% + ${burst.offsetX}px)`,
                top: `calc(50% + ${burst.offsetY}px)`,
                "--burst-duration": `${BURST_DURATION_MS}ms`,
                "--drift-x": `${burst.driftX}px`,
              }}
            >
              {burst.word}
            </span>
          ))}
        </li>
        <li className="card-cell">
          <div className={`card-value ${hand[1] ? "" : "is-hidden"}`}>
            {renderCardValue(hand[1], 1)}
          </div>
        </li>
        <li className="card-cell">
          <div className={`card-value ${hand[2] ? "" : "is-hidden"}`}>
            {renderCardValue(hand[2], 2)}
          </div>
        </li>
        <li className="card-cell">
          <div className={`card-value ${hand[3] ? "" : "is-hidden"}`}>
            {renderCardValue(hand[3], 3)}
          </div>
        </li>
        <li className="card-cell">
          <div className={`card-value ${hand[4] ? "" : "is-hidden"}`}>
            {renderCardValue(hand[4], 4)}
          </div>
        </li>
        <li className="card-cell">
          <div className={`card-value ${hand[5] ? "" : "is-hidden"}`}>
            {renderCardValue(hand[5], 5)}
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Hand;
