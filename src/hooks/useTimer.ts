import { useState, useRef, useCallback, useEffect } from "react";

export const useTimer = () => {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ensureInterval = useCallback(() => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current !== null) {
        setElapsed(Date.now() - startTimeRef.current);
      }
    }, 100);
  }, []);

  const start = useCallback(() => {
    if (startTimeRef.current !== null) {
      // Already timing — just ensure interval is alive
      // (may have been cleared by StrictMode effect cleanup)
      ensureInterval();
      return;
    }
    startTimeRef.current = Date.now();
    setElapsed(0);
    ensureInterval();
  }, [ensureInterval]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startTimeRef.current !== null) {
      setElapsed(Date.now() - startTimeRef.current);
      startTimeRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
    setElapsed(0);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return { elapsed, start, stop, reset };
};

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0
    ? `${hours}:${mm}:${ss}.${tenths}`
    : `${mm}:${ss}.${tenths}`;
};
