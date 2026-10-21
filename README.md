# Retro Blackjack

Blackjack against the dealer, drawn in plain line art after the green
handheld LCD games. Play it at
[blackjack.grahamhagenah.com](https://blackjack.grahamhagenah.com).

## How it plays

- **Deal** gives you two cards and the dealer one face-up card. On wider
  screens the **View Dealer** button shows that card after its label
  (View Dealer: Q), and **View Player** shows your total the same way.
- **Hit** takes another card. **Stand** ends your turn, and the dealer
  draws until reaching 17 or more.
- **Double**, on your first two cards, takes exactly one more card and then
  stands. The hand wins or loses double.
- A win is +20 points and a loss is −20 (±40 when doubled). Equal totals are
  a push.
- Filling all six card slots without busting wins the hand (six-card
  Charlie), for you or the dealer.
- You start with 200 points, kept between visits. At zero the game is over and
  **New Game** starts again at 200.

Keyboard: Space or Enter to deal and hit, **S** to stand, **D** to double,
**V** to switch between your hand and the dealer's.

## Development

```bash
npm install
npm start       # dev server at http://localhost:3000
npm test        # run tests
npm run lint    # check code with ESLint
npm run build   # production build in build/
```

Every push to `main` is linted, tested, built and deployed to GitHub Pages
(`.github/workflows/deploy.yml`).
