import { useState, useEffect, useCallback } from "react";
import type { BoardSize, BoardTheme } from "./types";
import { DEFAULT_THEME } from "./themes";
import { useKnightTour } from "./hooks/useKnightTour";
import { useTimer } from "./hooks/useTimer";
import { Board } from "./components/Board";
import { SizeSelector } from "./components/SizeSelector";
import { ThemeSelector } from "./components/ThemeSelector";
import { Controls } from "./components/Controls";
import { GameStatus } from "./components/GameStatus";
import { WinModal } from "./components/WinModal";
import "./App.css";

const isTutorial = window.location.pathname === "/tutorial";

export const App = () => {
  const [theme, setTheme] = useState<BoardTheme>(DEFAULT_THEME);
  const [showWinModal, setShowWinModal] = useState(false);

  const {
    state,
    validMoves,
    hintIndex,
    moveNumber,
    setSize,
    placeKnight,
    moveKnight,
    undo,
    reset,
  } = useKnightTour({ initialHintEnabled: isTutorial });

  const timer = useTimer();

  const handleSetSize = useCallback(
    (size: BoardSize) => {
      setSize(size);
      timer.reset();
      timer.start();
    },
    [setSize, timer],
  );

  const handleSquareClick = (index: number) => {
    if (state.phase === "idle") {
      if (!timer.isRunning) timer.start();
      placeKnight(index);
    } else if (state.phase === "playing" && validMoves.includes(index)) {
      moveKnight(index);
    }
  };

  const handleReset = useCallback(() => {
    reset();
    timer.reset();
    setShowWinModal(false);
  }, [reset, timer]);

  useEffect(() => {
    if (state.phase === "won") {
      timer.stop();
      if (!isTutorial) setShowWinModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  return (
    <div className="app">
      <Board
        state={state}
        validMoves={validMoves}
        hintIndex={hintIndex}
        moveNumber={moveNumber}
        theme={theme}
        onSquareClick={handleSquareClick}
      />
      <div className="app__sidebar">
        <GameStatus state={state} elapsed={timer.elapsed} />
        {state.phase === "idle" && (
          <SizeSelector current={state.boardSize} onSelect={handleSetSize} />
        )}
        <Controls
          phase={state.phase}
          canUndo={state.moveHistory.length > 0}
          onUndo={undo}
          onReset={handleReset}
        />
        <ThemeSelector current={theme} onSelect={setTheme} />
      </div>
      {showWinModal && (
        <WinModal
          elapsed={timer.elapsed}
          boardSize={state.boardSize}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </div>
  );
};
