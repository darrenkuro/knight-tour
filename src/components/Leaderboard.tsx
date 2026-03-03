import type { LeaderboardEntry } from "../types";
import { formatTime } from "../hooks/useTimer";
import "./Leaderboard.css";

type LeaderboardProps = {
  entries: LeaderboardEntry[];
  playerTime: number;
  playerName: string;
};

export const Leaderboard = ({ entries, playerTime, playerName }: LeaderboardProps) => {
  if (entries.length === 0) return null;

  return (
    <div className="leaderboard">
      <h3 className="leaderboard__title">Leaderboard</h3>
      <table className="leaderboard__table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const isPlayer = entry.name === playerName && entry.time === playerTime;
            return (
              <tr
                key={`${entry.name}-${entry.time}-${entry.date}`}
                className={isPlayer ? "leaderboard__row--highlight" : ""}
              >
                <td>{i + 1}</td>
                <td>{entry.name}</td>
                <td>{formatTime(entry.time)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
