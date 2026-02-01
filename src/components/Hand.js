import React, { useEffect, useRef, useState } from "react";

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

const Hand = ({ name, hand, total, playersTurn }) => {
  const lowAces = getLowAceIndexes(hand);
  const [bursts, setBursts] = useState([]);
  const prevTotalRef = useRef(total);
  const prevHandRef = useRef(hand);
  const burstIdRef = useRef(0);

  useEffect(() => {
    if (!playersTurn) {
      prevTotalRef.current = total;
      prevHandRef.current = hand;
      return;
    }
    const prevTotal = prevTotalRef.current;
    const prevHand = prevHandRef.current;
    let addedCard = null;
    for (let i = 0; i < hand.length; i += 1) {
      if (!prevHand[i] && hand[i]) {
        addedCard = hand[i];
        break;
      }
    }

    const bustHappened = total > 21 && prevTotal <= 21;
    const hitTwentyOne = total === 21 && prevTotal !== 21;
    const lastCards = hand.filter(Boolean);
    const lastCard = lastCards[lastCards.length - 1];
    const twoInRow =
      lastCards.length >= 2 &&
      lastCards[lastCards.length - 1] === lastCards[lastCards.length - 2];
    const threeInRow =
      lastCards.length >= 3 &&
      lastCards[lastCards.length - 1] === lastCards[lastCards.length - 2] &&
      lastCards[lastCards.length - 2] === lastCards[lastCards.length - 3];

    const triggers = [];
    if (bustHappened) {
      triggers.push("Unlucky!", "Oof!", "Bust!");
    }
    if (hitTwentyOne) {
      triggers.push("21!", "Blackjack!", "Perfect!");
    }
    if (addedCard === "A") {
      triggers.push("Ace!", "Lucky!", "Nice!");
    }
    if (addedCard === "J") {
      triggers.push("Haha", "Jolly!", "Nice!");
    }
    if (addedCard === "Q") {
      triggers.push("Your Majesty", "Queen!", "Royal!");
    }
    if (addedCard === "K") {
      triggers.push("Your Majesty", "King!", "Royal!");
    }
    if (threeInRow && lastCard) {
      triggers.push("Triple!", "Streak!", "Whoa!");
    } else if (twoInRow && lastCard) {
      triggers.push("Pair!", "Again!", "Nice!");
    }

    if (triggers.length > 0) {
      const word = triggers[Math.floor(Math.random() * triggers.length)];
      const id = burstIdRef.current++;
      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 760px)").matches;
      const offsetX = isMobile
        ? -14 + (Math.random() * 12 - 6)
        : (Math.random() < 0.5 ? -1 : 1) *
          (24 + Math.floor(Math.random() * 30));
      const offsetY = -56 - Math.floor(Math.random() * 24);
      setBursts((prev) => [
        ...prev,
        { id, word, offsetX, offsetY },
      ]);
      const timer = setTimeout(() => {
        setBursts((prev) => prev.filter((burst) => burst.id !== id));
      }, 1200);
      prevTotalRef.current = total;
      prevHandRef.current = hand;
      return () => clearTimeout(timer);
    }

    prevTotalRef.current = total;
    prevHandRef.current = hand;
  }, [hand, playersTurn, total]);

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
        <div className="vertical-divider">
          <span className="divider-segment" />
          <span className="divider-segment" />
          <span className="divider-segment" />
          <span className="divider-segment" />
          <span className="divider-segment" />
        </div>
        <div className="horizontal-divider">
          <span className="divider-segment" />
          <span className="divider-segment" />
        </div>
        <li className="card-cell">
          <div className={`card-value ${hand[0] ? "" : "is-hidden"}`}>
            {renderCardValue(hand[0], 0)}
          </div>
        </li>
        <li className="name">{name}</li>
        <li className="spacer"></li>
        <li className="spacer"></li>
        <li className="total">
          <span className={`total-label ${total > 0 ? "" : "is-hidden"}`}>
            Total
          </span>
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
