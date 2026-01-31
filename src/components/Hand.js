import React from "react";

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

const Hand = ({ name, hand, total }) => {
  const lowAces = getLowAceIndexes(hand);

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
