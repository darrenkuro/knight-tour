import type { GamePhase } from "../types";
import "./Controls.css";

type ControlsProps = {
  phase: GamePhase;
  hintEnabled: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onToggleHint: () => void;
};

export const Controls = ({
  phase,
  hintEnabled,
  canUndo,
  onUndo,
  onReset,
  onToggleHint,
}: ControlsProps) => {
  const isActive = phase === "playing" || phase === "stuck";

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
        className={`controls__btn controls__btn--hint${hintEnabled ? " controls__btn--hint-active" : ""}`}
        onClick={onToggleHint}
        disabled={!isActive}
      >
        {hintEnabled ? "Hint On" : "Hint"}
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
};
