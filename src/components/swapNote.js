// The small value after View Dealer / View Player ("· Q", "· 17"): what the
// other side is showing, so you can check it without switching views.
const swapNote = ({ switchView, playersTurn, dealerHand, playerTotal }) => {
  if (switchView) {
    return playerTotal > 0 ? String(playerTotal) : null;
  }
  const upcard = dealerHand[0];
  return playersTurn && upcard ? String(upcard) : null;
};

export default swapNote;
