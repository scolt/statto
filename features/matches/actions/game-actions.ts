"use server";

import { db } from "@/lib/db";
import { gamesTable } from "@/lib/db/schemas/games";
import { gameScoresTable } from "@/lib/db/schemas/game-scores";
import { gameMarksTable } from "@/lib/db/schemas/game-marks";
import { marksTable } from "@/lib/db/schemas/marks";

export type Mark = {
  id: number;
  name: string;
};

export async function getAllMarks(): Promise<Mark[]> {
  return db
    .select({
      id: marksTable.id,
      name: marksTable.name,
    })
    .from(marksTable)
    .orderBy(marksTable.name);
}

export type ReportGameInput = {
  matchId: number;
  scores: { playerId: number; score: number }[];
  markIds: number[];
  comment?: string;
};

export async function reportGame(input: ReportGameInput): Promise<number> {
  const [result] = await db.insert(gamesTable).values({
    matchId: input.matchId,
    comment: input.comment || null,
  });

  const gameId = result.insertId;

  // Insert scores
  if (input.scores.length > 0) {
    await db.insert(gameScoresTable).values(
      input.scores.map((s) => ({
        gameId,
        playerId: s.playerId,
        score: s.score,
      }))
    );
  }

  // Insert marks
  if (input.markIds.length > 0) {
    await db.insert(gameMarksTable).values(
      input.markIds.map((markId) => ({
        gameId,
        markId,
      }))
    );
  }

  return gameId;
}
