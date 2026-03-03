import { useState } from "react";
import type { BoardTheme } from "./types";
import { DEFAULT_THEME } from "./themes";
import { useKnightTour } from "./hooks/useKnightTour";
import { Board } from "./components/Board";
import { SizeSelector } from "./components/SizeSelector";
import { ThemeSelector } from "./components/ThemeSelector";
import { Controls } from "./components/Controls";
import { GameStatus } from "./components/GameStatus";
import "./App.css";

export const App = () => {
  const [theme, setTheme] = useState<BoardTheme>(DEFAULT_THEME);

  const {
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
  } = useKnightTour();

  const handleSquareClick = (index: number) => {
    if (state.phase === "idle") {
      placeKnight(index);
    } else if (
      state.phase === "playing" &&
      validMoves.includes(index)
    ) {
      moveKnight(index);
    }
  };

  return (
    <div className="app">
      <Board
        state={state}
        validMoves={validMoves}
        hintIndex={hintIndex}
        moveNumber={moveNumber}
        unsolvableStarts={unsolvableStarts}
        theme={theme}
        onSquareClick={handleSquareClick}
      />
      <div className="app__sidebar">
        <GameStatus state={state} />
        {state.phase === "idle" && (
          <SizeSelector current={state.boardSize} onSelect={setSize} />
        )}
        <Controls
          phase={state.phase}
          hintEnabled={state.hintEnabled}
          canUndo={state.moveHistory.length > 0}
          onUndo={undo}
          onReset={reset}
          onToggleHint={toggleHint}
        />
        <ThemeSelector current={theme} onSelect={setTheme} />
      </div>
    </div>
  );
};
