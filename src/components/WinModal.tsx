import { useState } from "react";
import type { BoardSize, LeaderboardEntry } from "../types";
import { formatTime } from "../hooks/useTimer";
import { Leaderboard } from "./Leaderboard";
import "./WinModal.css";

const SUBMISSION_LIMIT = 5;
const STORAGE_KEY = "leaderboard_submissions";

const getSubmissionCount = () =>
  Number(sessionStorage.getItem(STORAGE_KEY) || "0");

const incrementSubmissionCount = () =>
  sessionStorage.setItem(STORAGE_KEY, String(getSubmissionCount() + 1));

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
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(
    getSubmissionCount() >= SUBMISSION_LIMIT,
  );

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 20) return;

    setSubmitting(true);
    setError("");
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
        incrementSubmissionCount();
        if (getSubmissionCount() >= SUBMISSION_LIMIT) setLimitReached(true);
      } else if (res.status === 429) {
        setError("Too many submissions — take a breather!");
        setLimitReached(true);
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

        {error && <p className="win-modal__error">{error}</p>}

        {submitted ? (
          entries && (
            <Leaderboard
              entries={entries}
              playerTime={elapsed}
              playerName={name.trim()}
            />
          )
        ) : limitReached ? (
          <p className="win-modal__limit">
            Submission limit reached — try again next session!
          </p>
        ) : (
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
        )}
      </div>
    </div>
  );
};
