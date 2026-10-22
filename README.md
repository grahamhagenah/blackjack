# Retro Blackjack

Blackjack against the dealer, drawn in plain line art after the green
handheld LCD games. Play it at
[blackjack.grahamhagenah.com](https://blackjack.grahamhagenah.com).

## How it plays

- **Deal** gives you your first card and turns up the dealer's card. On wider
  screens the **View Dealer** button shows that card after its label
  (View Dealer: Q), and **View Player** shows your total the same way.
- **Hit** takes one more card at a time. **Stand** ends your turn, and the dealer
  draws until reaching 17 or more.
- **Double**, on your first two cards, takes exactly one more card; then you
  press **Stand**. The hand wins or loses double.
- A win is +20 points and a loss is −20 (±40 when doubled). Equal totals are
  a push.
- Filling all six card slots without busting wins the hand (six-card
  Charlie), for you or the dealer.
- You start with 200 points, kept between visits. At zero the game is over and
  **New Game** starts again at 200.

The moon/sun button switches between light and a soft dark mode. Until you
pick one it follows your device's setting, and your choice is remembered.

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
(`.github/workflows/deploy.yml`). Pull requests get the same checks without
deploying (`.github/workflows/ci.yml`).

Node 24 is pinned in `.nvmrc`. Dependabot opens monthly update pull requests
for npm packages and GitHub Actions, skipping releases younger than two
weeks. The JetBrains Mono font is bundled from `@fontsource/jetbrains-mono`,
so the game doesn't depend on Google Fonts.
