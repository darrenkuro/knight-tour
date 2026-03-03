import { useState } from "react";
import type { BoardSize, LeaderboardEntry } from "../types";
import { formatTime } from "../hooks/useTimer";
import { Leaderboard } from "./Leaderboard";
import "./WinModal.css";

type WinModalProps = {
  elapsed: number;
  boardSize: BoardSize;
  onClose: () => void;
};

export const WinModal = ({ elapsed, boardSize, onClose }: WinModalProps) => {
  const [name, setName] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 20) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, size: boardSize, time: elapsed }),
      });
      if (res.ok) {
        const data = (await res.json()) as LeaderboardEntry[];
        setEntries(data);
        setSubmitted(true);
      }
    } catch {
      // Silently fail — leaderboard is non-critical
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="win-modal-overlay" onClick={onClose}>
      <div className="win-modal" onClick={(e) => e.stopPropagation()}>
        <button className="win-modal__close" onClick={onClose}>
          &times;
        </button>

        <h2 className="win-modal__title">Tour Complete!</h2>
        <div className="win-modal__time">{formatTime(elapsed)}</div>
        <p className="win-modal__board">{boardSize}&times;{boardSize} board</p>

        {!submitted ? (
          <div className="win-modal__form">
            <input
              className="win-modal__input"
              type="text"
              placeholder="Your name"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              autoFocus
            />
            <button
              className="win-modal__submit"
              onClick={handleSubmit}
              disabled={name.trim().length === 0 || submitting}
            >
              {submitting ? "Submitting…" : "Submit Score"}
            </button>
          </div>
        ) : (
          entries && (
            <Leaderboard
              entries={entries}
              playerTime={elapsed}
              playerName={name.trim()}
            />
          )
        )}
      </div>
    </div>
  );
};
