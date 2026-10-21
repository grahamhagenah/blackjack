import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

const buildDeck = () => {
  const cards = [];
  const values = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];
  for (let suits = 0; suits < 4; suits += 1) {
    for (let i = 0; i < values.length; i += 1) {
      cards.push(values[i]);
    }
  }
  return cards;
};

test("renders score heading", () => {
  render(<App cards={buildDeck()} />);
  expect(screen.getByText(/score/i)).toBeInTheDocument();
});

test("switches between light and dark and remembers the choice", () => {
  document.documentElement.dataset.theme = "light";
  window.localStorage.clear();
  render(<App cards={buildDeck()} />);

  fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(window.localStorage.getItem("retro-blackjack-theme")).toBe("dark");

  fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(window.localStorage.getItem("retro-blackjack-theme")).toBe("light");
});
