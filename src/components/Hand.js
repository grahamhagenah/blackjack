import React from "react";

const Hand = ({ name, hand, total }) => {
  return (
    <div className="hand">
      <div className="vertical-divider"></div>
      <div className="horizontal-divider"></div>
      <ul>
        <li className="name">{name}</li>
        {total < 1 && <li className="total"></li>}
        {total > 0 && <li className="total">{total}</li>}
        <li><div className="card-value">{hand[0]}</div></li>
        <li><div className="card-value">{hand[1]}</div></li>
        <li><div className="card-value">{hand[2]}</div></li>
        <li><div className="card-value">{hand[3]}</div></li>
        <li><div className="card-value">{hand[4]}</div></li>
        <li><div className="card-value">{hand[5]}</div></li>
      </ul>
    </div>
  );
};

export default Hand;
