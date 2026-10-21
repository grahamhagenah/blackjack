// The small second line on the View Dealer / View Player button: what the
// other side is showing, so you can check it without switching views.
const swapNote = ({ switchView, playersTurn, dealerHand, playerTotal }) => {
  if (switchView) {
    return playerTotal > 0 ? `shows ${playerTotal}` : null;
  }
  const upcard = dealerHand[0];
  return playersTurn && upcard ? `shows ${upcard}` : null;
};

export default swapNote;
