<div align="center">

# Knight's Tour

> Interactive puzzle game — visit every square on the board with a chess knight

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vite.dev/)

</div>

---

## How to Play

1. **Pick a board size** (5×5 to 12×12)
2. **Click any square** to place the knight
3. **Move** to highlighted squares (valid L-shaped moves)
4. **Goal**: visit all N² squares exactly once

Use **Hint** for Warnsdorff's heuristic guidance, **Undo** to backtrack, **Reset** to start over.

## Features

- Board sizes from 5×5 (25 squares) to 12×12 (144 squares)
- 5 board themes (Classic, Chess.com, Ice, Walnut, Neon)
- Warnsdorff's rule hint system with center-distance tiebreaker
- Unsolvable starting positions dimmed on odd-sized boards
- Move history with numbered badges and recent-move highlights
- Undo/reset with state preservation
- Responsive layout (desktop sidebar, mobile stacked)

## Setup

```sh
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # production build → dist/
```

## Math: Knight's Tour Solvability

### Existence

A knight's tour exists on any n×n board where **n ≥ 5**. This was proven by Schwenk (1991) for rectangular boards. There is **no upper limit** — tours have been computed on boards exceeding 1000×1000.

For boards smaller than 5×5, no knight's tour exists:
- **1×1**: trivial (1 square)
- **2×2, 3×3, 4×4**: impossible — the knight cannot reach all squares

### The Parity Constraint (Odd Boards)

A knight always alternates between light and dark squares. On an **even-sized board** (6, 8, 10, 12), light and dark squares are equal in count, so a tour can start from any square.

On an **odd-sized board** (5, 7, 9, 11), one color has one more square than the other:

| Board | Total | Majority | Minority | Unsolvable starts |
|-------|-------|----------|----------|-------------------|
| 5×5   | 25    | 13       | 12       | 12 (48%)          |
| 6×6   | 36    | 18       | 18       | 0                 |
| 7×7   | 49    | 25       | 24       | 24 (49%)          |
| 8×8   | 64    | 32       | 32       | 0                 |
| 9×9   | 81    | 41       | 40       | 40 (49%)          |
| 10×10 | 100   | 50       | 50       | 0                 |
| 11×11 | 121   | 61       | 60       | 60 (50%)          |
| 12×12 | 144   | 72       | 72       | 0                 |

Since a tour of n² moves alternates colors, the first and last squares share the same color when n² is odd. The tour visits `⌈n²/2⌉` squares of the starting color and `⌊n²/2⌋` of the other. Since all squares must be visited, **the starting square must be on the majority color**. Starting on a minority-color square is mathematically impossible — no sequence of moves can complete the tour.

The app dims these unsolvable starting squares on odd boards.

### Warnsdorff's Heuristic

The hint system uses **Warnsdorff's rule** (1823): always move to the square with the fewest onward moves. This greedy heuristic finds complete tours with high probability (~75% on 8×8) without backtracking. Ties are broken by preferring squares closer to the board center, which avoids getting trapped in corners early.

## Tech Stack

- **React 19** + **TypeScript 5.7** (strict)
- **Vite 6** for dev/build
- **Plain CSS** (co-located with components, BEM naming)
- **Vercel** deployment

## Project Structure

```
src/
├── types.ts               # Position, GamePhase, SquareState, GameState, BoardTheme
├── themes.ts              # 5 board color themes
├── hooks/
│   └── useKnightTour.ts   # useReducer: game logic, Warnsdorff's, undo
├── components/
│   ├── Board.tsx/.css      # CSS Grid board, theme CSS vars
│   ├── Square.tsx/.css     # Square states, knight SVG, number badges
│   ├── KnightIcon.tsx      # Chess-piece SVG (chess.com style)
│   ├── SizeSelector.tsx/.css
│   ├── ThemeSelector.tsx/.css
│   ├── Controls.tsx/.css
│   └── GameStatus.tsx/.css
├── App.tsx/.css
├── main.tsx
└── index.css              # Reset, CSS vars, dark theme
```

## License

[MIT](LICENSE)
