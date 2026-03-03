import type { GamePhase, GameState } from "../types";
import "./GameStatus.css";

type GameStatusProps = {
  state: GameState;
};

const phaseMessages: Record<GamePhase, string> = {
  idle: "Click any square to place the knight",
  playing: "Click a highlighted square to move",
  won: "You completed the tour!",
  stuck: "No valid moves — undo or reset",
};

export const GameStatus = ({ state }: GameStatusProps) => {
  const total = state.boardSize * state.boardSize;
  const pct = total > 0 ? (state.moveCount / total) * 100 : 0;

  return (
    <div className="game-status">
      <h1 className="game-status__title">
        Knight's Tour <span>♞</span>
      </h1>

      <div className={`game-status__phase game-status__phase--${state.phase}`}>
        {phaseMessages[state.phase]}
      </div>

      {state.phase !== "idle" && (
        <div className="game-status__progress">
          <div className="game-status__progress-label">
            <span>Progress</span>
            <span>
              {state.moveCount} / {total}
            </span>
          </div>
          <div className="game-status__progress-bar">
            <div
              className={`game-status__progress-fill${state.phase === "won" ? " game-status__progress-fill--won" : ""}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {state.phase === "idle" && (
        <div className="game-status__rules">
          <p>Visit every square on the board exactly once.</p>
          <p>The knight moves in an L-shape: two squares in one direction and one square perpendicular.</p>
          <p>Use the hint button for Warnsdorff's rule guidance.</p>
          {state.boardSize % 2 !== 0 && (
            <p className="game-status__warning">
              Dimmed squares are unsolvable starting positions on odd boards.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
