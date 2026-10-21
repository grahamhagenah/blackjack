import { fireEvent, render, screen } from "@testing-library/react";
import HowToPlay from "./HowToPlay";

describe("HowToPlay", () => {
  it("explains the actions and payouts", () => {
    render(<HowToPlay onClose={() => {}} />);
    expect(screen.getByRole("dialog", { name: "How to Play" })).toBeInTheDocument();
    for (const action of ["Deal", "Hit", "Stand", "Double", "View Dealer"]) {
      expect(screen.getByText(action, { selector: "dt" })).toBeInTheDocument();
    }
    expect(screen.getByText("+30")).toBeInTheDocument();
    expect(screen.getByText("−40")).toBeInTheDocument();
  });

  it("closes with Escape and with the button", () => {
    const onClose = vi.fn();
    render(<HowToPlay onClose={onClose} />);
    fireEvent.keyDown(document.body, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Back to game" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("keeps game shortcuts from reaching the game while open", () => {
    const gameKeys = vi.fn();
    window.addEventListener("keydown", gameKeys);
    const { unmount } = render(<HowToPlay onClose={() => {}} />);

    fireEvent.keyDown(document.body, { key: " ", code: "Space" });
    fireEvent.keyDown(document.body, { key: "s" });
    expect(gameKeys).not.toHaveBeenCalled();

    unmount();
    fireEvent.keyDown(document.body, { key: "s" });
    expect(gameKeys).toHaveBeenCalledTimes(1);
    window.removeEventListener("keydown", gameKeys);
  });
});
