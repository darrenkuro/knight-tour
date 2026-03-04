import { useReducer, useMemo } from "react";
import type { BoardSize, GameState, Position } from "../types";

const KNIGHT_OFFSETS: readonly Position[] = [
  { row: -2, col: -1 },
  { row: -2, col: 1 },
  { row: -1, col: -2 },
  { row: -1, col: 2 },
  { row: 1, col: -2 },
  { row: 1, col: 2 },
  { row: 2, col: -1 },
  { row: 2, col: 1 },
];

type Action =
  | { type: "SET_SIZE"; size: BoardSize }
  | { type: "PLACE_KNIGHT"; index: number }
  | { type: "MOVE_KNIGHT"; index: number }
  | { type: "UNDO" }
  | { type: "RESET" }
  | { type: "TOGGLE_HINT" };

const createInitialState = (
  size: BoardSize,
  hintEnabled = false,
): GameState => ({
  boardSize: size,
  phase: "idle",
  visited: Array.from<boolean>({ length: size * size }).fill(false),
  moveHistory: [],
  moveCount: 0,
  currentIndex: null,
  hintEnabled,
});

const toPos = (index: number, size: number): Position => ({
  row: Math.floor(index / size),
  col: index % size,
});

const toIndex = (pos: Position, size: number): number =>
  pos.row * size + pos.col;

const getValidMoves = (
  index: number,
  visited: boolean[],
  size: number
): number[] => {
  const pos = toPos(index, size);
  return KNIGHT_OFFSETS.map((offset) => ({
    row: pos.row + offset.row,
    col: pos.col + offset.col,
  }))
    .filter(
      (p) =>
        p.row >= 0 &&
        p.row < size &&
        p.col >= 0 &&
        p.col < size &&
        !visited[toIndex(p, size)]
    )
    .map((p) => toIndex(p, size));
};

const rebuildFromHistory = (
  history: number[],
  size: number
): Pick<GameState, "visited" | "currentIndex" | "moveCount"> => {
  const visited = Array.from<boolean>({ length: size * size }).fill(false);
  for (const idx of history) {
    visited[idx] = true;
  }
  return {
    visited,
    currentIndex: history.length > 0 ? history[history.length - 1]! : null,
    moveCount: history.length,
  };
};

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case "SET_SIZE":
      return createInitialState(action.size, state.hintEnabled);

    case "PLACE_KNIGHT": {
      const visited = [...state.visited];
      visited[action.index] = true;
      const history = [action.index];
      const validMoves = getValidMoves(action.index, visited, state.boardSize);
      return {
        ...state,
        phase: validMoves.length === 0 ? "stuck" : "playing",
        visited,
        moveHistory: history,
        moveCount: 1,
        currentIndex: action.index,
      };
    }

    case "MOVE_KNIGHT": {
      const visited = [...state.visited];
      visited[action.index] = true;
      const history = [...state.moveHistory, action.index];
      const totalSquares = state.boardSize * state.boardSize;
      const moveCount = history.length;

      if (moveCount === totalSquares) {
        return {
          ...state,
          phase: "won",
          visited,
          moveHistory: history,
          moveCount,
          currentIndex: action.index,
        };
      }

      const validMoves = getValidMoves(action.index, visited, state.boardSize);
      return {
        ...state,
        phase: validMoves.length === 0 ? "stuck" : "playing",
        visited,
        moveHistory: history,
        moveCount,
        currentIndex: action.index,
      };
    }

    case "UNDO": {
      if (state.moveHistory.length <= 1) {
        return {
          ...createInitialState(state.boardSize),
          hintEnabled: state.hintEnabled,
        };
      }
      const history = state.moveHistory.slice(0, -1);
      const rebuilt = rebuildFromHistory(history, state.boardSize);
      const hasValidMoves =
        rebuilt.currentIndex !== null &&
        getValidMoves(rebuilt.currentIndex, rebuilt.visited, state.boardSize).length > 0;
      return {
        ...state,
        phase: hasValidMoves ? "playing" : "stuck",
        ...rebuilt,
        moveHistory: history,
      };
    }

    case "RESET":
      return {
        ...createInitialState(state.boardSize),
        phase: "idle",
        hintEnabled: state.hintEnabled,
      };

    case "TOGGLE_HINT":
      return { ...state, hintEnabled: !state.hintEnabled };
  }
};

const getWarnsdorffHint = (
  index: number,
  visited: boolean[],
  size: number
): number | null => {
  const moves = getValidMoves(index, visited, size);
  if (moves.length === 0) return null;

  const center = (size - 1) / 2;
  let bestMove = moves[0]!;
  let bestScore = Infinity;

  for (const move of moves) {
    const onward = getValidMoves(move, visited, size).length;
    const pos = toPos(move, size);
    const dist = Math.abs(pos.row - center) + Math.abs(pos.col - center);
    // Lower onward count is better; on tie, prefer center
    const score = onward * 100 - dist;
    if (score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

const isUnsolvableStart = (index: number, size: number): boolean => {
  if (size % 2 === 0) return false;
  const row = Math.floor(index / size);
  const col = index % size;
  const isLight = (row + col) % 2 === 0;
  // On odd boards, majority color has ceil(n²/2) squares.
  // Top-left (0,0) is always light, so light = majority.
  // Tour must start on majority color.
  return !isLight;
};

type UseKnightTourOptions = {
  initialHintEnabled?: boolean;
};

export const useKnightTour = ({ initialHintEnabled = false }: UseKnightTourOptions = {}) => {
  const [state, dispatch] = useReducer(
    reducer,
    createInitialState(5 as BoardSize, initialHintEnabled),
  );

  const validMoves = useMemo(() => {
    if (state.currentIndex === null || state.phase !== "playing") return [];
    return getValidMoves(state.currentIndex, state.visited, state.boardSize);
  }, [state.currentIndex, state.visited, state.boardSize, state.phase]);

  const hintIndex = useMemo(() => {
    if (!state.hintEnabled || state.currentIndex === null || state.phase !== "playing")
      return null;
    return getWarnsdorffHint(state.currentIndex, state.visited, state.boardSize);
  }, [state.hintEnabled, state.currentIndex, state.visited, state.boardSize, state.phase]);

  const moveNumber = useMemo(() => {
    const map = new Map<number, number>();
    state.moveHistory.forEach((idx, i) => map.set(idx, i + 1));
    return map;
  }, [state.moveHistory]);

  const setSize = (size: BoardSize) => dispatch({ type: "SET_SIZE", size });
  const placeKnight = (index: number) => dispatch({ type: "PLACE_KNIGHT", index });
  const moveKnight = (index: number) => dispatch({ type: "MOVE_KNIGHT", index });
  const undo = () => dispatch({ type: "UNDO" });
  const reset = () => dispatch({ type: "RESET" });
  const toggleHint = () => dispatch({ type: "TOGGLE_HINT" });

  const unsolvableStarts = useMemo(() => {
    if (state.phase !== "idle" || state.boardSize % 2 === 0) return new Set<number>();
    const set = new Set<number>();
    const total = state.boardSize * state.boardSize;
    for (let i = 0; i < total; i++) {
      if (isUnsolvableStart(i, state.boardSize)) set.add(i);
    }
    return set;
  }, [state.phase, state.boardSize]);

  return {
    state,
    validMoves,
    hintIndex,
    moveNumber,
    unsolvableStarts,
    setSize,
    placeKnight,
    moveKnight,
    undo,
    reset,
    toggleHint,
  };
};
