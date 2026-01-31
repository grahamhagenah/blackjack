import React from "react";

const Hand = ({ name, hand, total }) => {
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
            {hand[0] || "0"}
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
            {hand[1] || "0"}
          </div>
        </li>
        <li className="card-cell">
          <div className={`card-value ${hand[2] ? "" : "is-hidden"}`}>
            {hand[2] || "0"}
          </div>
        </li>
        <li className="card-cell">
          <div className={`card-value ${hand[3] ? "" : "is-hidden"}`}>
            {hand[3] || "0"}
          </div>
        </li>
        <li className="card-cell">
          <div className={`card-value ${hand[4] ? "" : "is-hidden"}`}>
            {hand[4] || "0"}
          </div>
        </li>
        <li className="card-cell">
          <div className={`card-value ${hand[5] ? "" : "is-hidden"}`}>
            {hand[5] || "0"}
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Hand;
