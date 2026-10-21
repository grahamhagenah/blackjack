import React, { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

const RESULTS = [
  ["You win", "+20"],
  ["Blackjack (Ace + ten-card as your first two cards)", "+30"],
  ["You win after doubling", "+40"],
  ["Push (same total as the dealer)", "0"],
  ["You lose", "−20"],
  ["You lose after doubling", "−40"],
];

const KEYS = [
  ["Space / Enter", "Deal or Hit"],
  ["S", "Stand"],
  ["D", "Double"],
  ["V", "View Dealer / View Player"],
];

// Full-screen rules page. The game stays as it was underneath.
const HowToPlay = ({ onClose }) => {
  const pageRef = useRef(null);

  useEffect(() => {
    // Remember what had focus (the ? button) to return to it on close
    const opener = document.activeElement;
    pageRef.current?.focus();
    // Catch keys before the game's own shortcuts so Space doesn't deal a card
    // behind the page. Default actions (like pressing a focused button) still run.
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      event.stopImmediatePropagation();
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="rules-page"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-title"
      tabIndex={-1}
      ref={pageRef}
    >
      {/* Sticky strip with the title; text scrolls under it, not under the × */}
      <header className="rules-topbar">
        <div className="rules-topbar-inner">
          <h1 id="rules-title">How to Play</h1>
        </div>
      </header>
      <button
        className="pushable help-button rules-x"
        onClick={onClose}
        aria-label="Close How to Play"
      >
        <span className="front">
          <XMarkIcon aria-hidden="true" />
        </span>
      </button>

      <div className="rules-content">
        <section>
          <h2>Goal</h2>
          <p>
            Finish closer to 21 than the dealer without going over. Going over
            21 is a bust, and a bust loses.
          </p>
        </section>

        <section>
          <h2>Card values</h2>
          <ul>
            <li>2 through 10 count as their number.</li>
            <li>J, Q and K count as 10.</li>
            <li>
              A counts as 11, or as 1 if 11 would make you bust (marked ↓1).
            </li>
          </ul>
        </section>

        <section>
          <h2>Your turn</h2>
          <dl className="rules-actions">
            <dt>Deal</dt>
            <dd>Gives you your first card and turns up the dealer's card.</dd>
            <dt>Hit</dt>
            <dd>Takes one more card. Hit as often as you like.</dd>
            <dt>Stand</dt>
            <dd>
              Keeps your total and ends your turn. You need at least two cards
              to stand.
            </dd>
            <dt>Double</dt>
            <dd>
              Only on your first two cards: your win or loss counts twice, you
              get exactly one more card, and then you stand.
            </dd>
            <dt>View Dealer</dt>
            <dd>
              Switches to the dealer's hand and back. On wider screens the
              button also shows the dealer's card or your total.
            </dd>
          </dl>
        </section>

        <section>
          <h2>Dealer's turn</h2>
          <p>
            After you stand, the dealer draws until reaching 17 or more, then
            the totals are compared.
          </p>
        </section>

        <section>
          <h2>Results</h2>
          <table className="rules-results">
            <tbody>
              {RESULTS.map(([result, points]) => (
                <tr key={result}>
                  <td>{result}</td>
                  <td>{points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            A blackjack wins right away unless the dealer's second card gives
            them blackjack too, which is a push. Fill all six card slots
            without busting and that hand wins automatically (six-card
            Charlie), for you or the dealer.
          </p>
        </section>

        <section>
          <h2>Your score</h2>
          <p>
            You start with 200 points, and your score is kept between visits.
            If it reaches zero, the game is over and New Game starts you again
            at 200.
          </p>
        </section>

        <section className="rules-keys">
          <h2>Keyboard</h2>
          <dl className="rules-actions">
            {KEYS.map(([key, action]) => (
              <React.Fragment key={key}>
                <dt>
                  <kbd>{key}</kbd>
                </dt>
                <dd>{action}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>

        <div className="rules-footer">
          <button className="pushable rules-close" onClick={onClose}>
            <span className="front">Back to game</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;
