export type BoardSize = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Position = { row: number; col: number };

export type GamePhase = "idle" | "playing" | "won" | "stuck";

export type SquareState = "empty" | "visited" | "current" | "valid" | "hint" | "unsolvable";

export type GameState = {
  boardSize: BoardSize;
  phase: GamePhase;
  visited: boolean[];
  moveHistory: number[];
  moveCount: number;
  currentIndex: number | null;
  hintEnabled: boolean;
};

export type BoardTheme = {
  id: string;
  name: string;
  light: string;
  dark: string;
  visitedLight: string;
  visitedDark: string;
  current: string;
  validHighlight: string;
  hintHighlight: string;
  knightFill: string;
  numberColor: string;
  numberBg: string;
};
