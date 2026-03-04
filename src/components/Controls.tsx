import type { GamePhase } from "../types";
import "./Controls.css";

type ControlsProps = {
  phase: GamePhase;
  canUndo: boolean;
  timerActive: boolean;
  onUndo: () => void;
  onReset: () => void;
  onQuit: () => void;
};

export const Controls = ({
  phase,
  canUndo,
  timerActive,
  onUndo,
  onReset,
  onQuit,
}: ControlsProps) => {
  const hasProgress = phase !== "idle" || timerActive;

  return (
    <div className="controls">
      <button
        className="controls__btn"
        onClick={onUndo}
        disabled={!canUndo || phase === "won"}
      >
        Undo
      </button>
      <button
        className="controls__btn controls__btn--reset"
        onClick={onReset}
        disabled={!hasProgress || phase === "won"}
      >
        Reset
      </button>
      <button
        className="controls__btn controls__btn--quit"
        onClick={onQuit}
        disabled={!hasProgress}
      >
        Quit
      </button>
    </div>
  );
};
