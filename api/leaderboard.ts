import { kv } from "@vercel/kv";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type LeaderboardEntry = {
  name: string;
  time: number;
  date: string;
};

const VALID_SIZES = [5, 6, 7, 8, 9, 10, 11, 12];
const MAX_ENTRIES = 10;

const kvKey = (size: number) => `leaderboard:${size}`;

const getTopEntries = async (size: number): Promise<LeaderboardEntry[]> => {
  const raw = await kv.zrange<string[]>(kvKey(size), 0, MAX_ENTRIES - 1);
  return raw.map((entry) => JSON.parse(entry) as LeaderboardEntry);
};

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
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

    const entry: LeaderboardEntry = {
      name: name.trim(),
      time,
      date: new Date().toISOString(),
    };

    // Use JSON string as member, time as score for sorting
    await kv.zadd(kvKey(size), { score: time, member: JSON.stringify(entry) });

    const entries = await getTopEntries(size);
    return res.status(200).json(entries);
  }

  return res.status(405).json({ error: "Method not allowed" });
};
