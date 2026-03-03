# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm dev        # Vite dev server at localhost:5173
pnpm build      # TypeScript check + Vite production build → dist/
pnpm preview    # Preview production build locally
```

No test framework is configured. Verify changes with `pnpm build` (runs `tsc -b && vite build`).

## Architecture

Interactive Knight's Tour puzzle game — React 19 + TypeScript 5.7 (strict) + Vite 6, deployed on Vercel.

### State Management

All game logic lives in `src/hooks/useKnightTour.ts` as a `useReducer` with 6 actions: `SET_SIZE`, `PLACE_KNIGHT`, `MOVE_KNIGHT`, `UNDO`, `RESET`, `TOGGLE_HINT`. The reducer is the single source of truth — components never mutate game state directly.

Key derived values (`validMoves`, `hintIndex`, `moveNumber`, `unsolvableStarts`) are `useMemo`-computed from reducer state.

### Game Flow

`App.tsx` orchestrates: routes clicks to `placeKnight` (idle phase) or `moveKnight` (playing phase). Four phases: `idle` → `playing` → `won`/`stuck`.

### Key Algorithms

- **`getValidMoves()`**: L-shaped offsets filtered by bounds + unvisited
- **`getWarnsdorffHint()`**: Greedy heuristic — pick square with fewest onward moves, tiebreak by Manhattan distance to center
- **`isUnsolvableStart()`**: On odd boards, minority-color squares can't start a complete tour (parity constraint)

### Styling

Plain CSS co-located with components using BEM naming. Theme colors are passed as CSS custom variables (`--sq-light`, `--sq-dark`, etc.) on the board element. Five themes defined in `src/themes.ts`. Board sizing uses `clamp()` for responsiveness; mobile breakpoint at 640px stacks the layout.
