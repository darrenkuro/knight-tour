import type { GameState, SquareState, BoardTheme } from "../types";
import { Square } from "./Square";
import "./Board.css";

type BoardProps = {
  state: GameState;
  validMoves: number[];
  hintIndex: number | null;
  moveNumber: Map<number, number>;
  unsolvableStarts: Set<number>;
  theme: BoardTheme;
  onSquareClick: (index: number) => void;
};

export const Board = ({
  state,
  validMoves,
  hintIndex,
  moveNumber,
  unsolvableStarts,
  theme,
  onSquareClick,
}: BoardProps) => {
  const total = state.boardSize * state.boardSize;
  const validSet = new Set(validMoves);

  const getSquareState = (index: number): SquareState => {
    if (index === state.currentIndex) return "current";
    if (index === hintIndex && validSet.has(index)) return "hint";
    if (validSet.has(index)) return "valid";
    if (state.visited[index]) return "visited";
    if (unsolvableStarts.has(index)) return "unsolvable";
    return "empty";
  };

  return (
    <div
      className="board"
      style={{
        "--board-size": state.boardSize,
        "--sq-light": theme.light,
        "--sq-dark": theme.dark,
        "--sq-visited-light": theme.visitedLight,
        "--sq-visited-dark": theme.visitedDark,
        "--sq-current": theme.current,
        "--sq-valid-highlight": theme.validHighlight,
        "--sq-hint-highlight": theme.hintHighlight,
      } as React.CSSProperties}
    >
      {Array.from({ length: total }, (_, i) => (
        <Square
          key={i}
          index={i}
          boardSize={state.boardSize}
          state={getSquareState(i)}
          moveNum={moveNumber.get(i)}
          totalMoves={state.moveCount}
          theme={theme}
          onClick={() => onSquareClick(i)}
        />
      ))}
    </div>
  );
};
