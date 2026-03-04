import type { GamePhase } from "../types";
import "./Controls.css";

type ControlsProps = {
  phase: GamePhase;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onQuit: () => void;
};

export const Controls = ({
  phase,
  canUndo,
  onUndo,
  onReset,
  onQuit,
}: ControlsProps) => {
  const inGame = phase !== "idle";

  return (
    <div className="controls">
      <button
        className="controls__btn"
        onClick={onUndo}
        disabled={!canUndo}
      >
        Undo
      </button>
      <button
        className="controls__btn controls__btn--reset"
        onClick={onReset}
        disabled={!inGame}
      >
        Reset
      </button>
      <button
        className="controls__btn controls__btn--quit"
        onClick={onQuit}
        disabled={!inGame}
      >
        Quit
      </button>
    </div>
  );
};
