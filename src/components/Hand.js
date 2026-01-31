import React from "react";

const Hand = ({ name, hand, total }) => {
  return (
    <div className="hand">
      <div className="vertical-divider">
        <span className="divider-segment" />
        <span className="divider-segment" />
        <span className="divider-segment" />
        <span className="divider-segment" />
        <span className="divider-segment" />
      </div>
      <div className="horizontal-divider"></div>
      <ul className="hand-grid">
        <li className="card-cell">
          <div className="card-value">{hand[0]}</div>
        </li>
        <li className="name">{name}</li>
        <li className="spacer"></li>
        <li className="spacer"></li>
        <li className="total">
          {total > 0 ? (
            <>
              <span className="total-label">Total</span>
              <span className="total-value">{total}</span>
            </>
          ) : (
            ""
          )}
        </li>
        <li className="card-cell">
          <div className="card-value">{hand[1]}</div>
        </li>
        <li className="card-cell">
          <div className="card-value">{hand[2]}</div>
        </li>
        <li className="card-cell">
          <div className="card-value">{hand[3]}</div>
        </li>
        <li className="card-cell">
          <div className="card-value">{hand[4]}</div>
        </li>
        <li className="card-cell">
          <div className="card-value">{hand[5]}</div>
        </li>
      </ul>
    </div>
  );
};

export default Hand;
