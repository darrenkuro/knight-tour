import type { GamePhase } from "../types";
import "./Controls.css";

type ControlsProps = {
  phase: GamePhase;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
};

export const Controls = ({
  phase,
  canUndo,
  onUndo,
  onReset,
}: ControlsProps) => (
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
      disabled={phase === "idle"}
    >
      Reset
    </button>
  </div>
);
