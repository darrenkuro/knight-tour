import type { SquareState, BoardTheme } from "../types";
import { KnightIcon } from "./KnightIcon";
import "./Square.css";

type SquareProps = {
  index: number;
  boardSize: number;
  state: SquareState;
  moveNum: number | undefined;
  totalMoves: number;
  theme: BoardTheme;
  onClick: () => void;
};

export const Square = ({
  index,
  boardSize,
  state,
  moveNum,
  totalMoves,
  theme,
  onClick,
}: SquareProps) => {
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;
  const isLight = (row + col) % 2 === 0;

  const classNames = [
    "square",
    isLight ? "square--light" : "square--dark",
    state === "visited" && "square--visited",
    state === "current" && "square--current",
    state === "valid" && "square--valid",
    state === "hint" && "square--valid square--hint",
    state === "empty" && "square--idle",
  ]
    .filter(Boolean)
    .join(" ");

  const isClickable = state === "empty" || state === "valid" || state === "hint";

  // Recent moves (last 3) get brighter badges
  const isRecent = moveNum !== undefined && totalMoves - moveNum < 3;

  return (
    <button
      className={classNames}
      onClick={isClickable ? onClick : undefined}
      aria-label={`Square ${col + 1}, ${row + 1}${state === "current" ? " (knight)" : ""}`}
      tabIndex={isClickable ? 0 : -1}
    >
      {state === "current" ? (
        <KnightIcon fill={theme.knightFill} className="square__knight" />
      ) : moveNum !== undefined ? (
        <span
          className={`square__number${isRecent ? " square__number--recent" : ""}`}
          style={{
            "--num-color": theme.numberColor,
            "--num-bg": theme.numberBg,
          } as React.CSSProperties}
        >
          {moveNum}
        </span>
      ) : null}
    </button>
  );
};
