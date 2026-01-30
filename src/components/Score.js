import React from "react";
import CountUp from "react-countup";

const Score = ({ score, change }) => {
  return (
    <div id="score">
      <h2>Score</h2>
      <h3 id="score-count">
        <CountUp start={score} end={score + change} duration={2} />
      </h3>
    </div>
  );
};

export default Score;
