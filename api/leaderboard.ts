import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type LeaderboardEntry = {
  name: string;
  time: number;
  date: string;
};

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"),
  prefix: "ratelimit:leaderboard",
});

const VALID_SIZES = [5, 6, 7, 8, 9, 10, 11, 12];
const MAX_ENTRIES = 10;

// Minimum plausible solve time in seconds per board size.
// A knight's tour on an NxN board requires N*N-1 moves; even a speedrunner
// needs at least ~0.4s per move, so min ≈ (N*N - 1) * 0.4.
const MIN_TIME: Record<number, number> = {
  5: 10,
  6: 14,
  7: 19,
  8: 25,
  9: 32,
  10: 40,
  11: 48,
  12: 57,
};

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://knightstour.darren0xa.dev";

const kvKey = (size: number) => `leaderboard:${size}`;

const getTopEntries = async (size: number): Promise<LeaderboardEntry[]> => {
  const raw = await redis.zrange<string[]>(kvKey(size), 0, MAX_ENTRIES - 1);
  return raw.map((entry) =>
    typeof entry === "string"
      ? (JSON.parse(entry) as LeaderboardEntry)
      : (entry as unknown as LeaderboardEntry),
  );
};

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const size = Number(req.query.size);
    if (!VALID_SIZES.includes(size)) {
      return res.status(400).json({ error: "Invalid board size" });
    }
    const entries = await getTopEntries(size);
    return res.status(200).json(entries);
  }

  if (req.method === "POST") {
    const { name, size, time } = req.body as {
      name: string;
      size: number;
      time: number;
    };

    if (
      typeof name !== "string" ||
      name.trim().length < 1 ||
      name.trim().length > 20
    ) {
      return res.status(400).json({ error: "Name must be 1-20 characters" });
    }
    if (!VALID_SIZES.includes(size)) {
      return res.status(400).json({ error: "Invalid board size" });
    }
    if (typeof time !== "number" || time <= 0) {
      return res.status(400).json({ error: "Time must be positive" });
    }
    if (time < MIN_TIME[size]) {
      return res.status(400).json({ error: "Submitted time is impossibly fast" });
    }

    // Rate limit by IP — checked after validation so bad requests don't burn tokens
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      (Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded?.split(",")[0]?.trim()) ||
      req.socket.remoteAddress ||
      "unknown";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return res.status(429).json({ error: "Too many submissions, try again later" });
    }

    const entry: LeaderboardEntry = {
      name: name.trim(),
      time,
      date: new Date().toISOString(),
    };

    await redis.zadd(kvKey(size), { score: time, member: JSON.stringify(entry) });
    await redis.zremrangebyrank(kvKey(size), MAX_ENTRIES, -1);

    const entries = await getTopEntries(size);
    return res.status(200).json(entries);
  }

  return res.status(405).json({ error: "Method not allowed" });
};
