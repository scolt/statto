"use server";

import { db } from "@/lib/db";
import { matchesTable } from "@/lib/db/schemas/matches";
import { matchPlayersTable } from "@/lib/db/schemas/match-players";
import { gamesTable } from "@/lib/db/schemas/games";
import { gameScoresTable } from "@/lib/db/schemas/game-scores";
import { gameMarksTable } from "@/lib/db/schemas/game-marks";
import { playersTable } from "@/lib/db/schemas/players";
import { marksTable } from "@/lib/db/schemas/marks";
import { eq } from "drizzle-orm";

export type MatchStatus = "new" | "in_progress" | "done";

export type MatchDetail = {
  id: number;
  groupId: number;
  date: Date;
  startedAt: Date | null;
  status: MatchStatus;
  comment: string | null;
};

export type GameWithDetails = {
  id: number;
  comment: string | null;
  scores: { playerId: number; playerName: string; score: number }[];
  marks: { id: number; name: string }[];
};

export async function getMatchById(matchId: number): Promise<MatchDetail | null> {
  const rows = await db
    .select({
      id: matchesTable.id,
      groupId: matchesTable.groupId,
      date: matchesTable.date,
      startedAt: matchesTable.startedAt,
      status: matchesTable.status,
      comment: matchesTable.comment,
    })
    .from(matchesTable)
    .where(eq(matchesTable.id, matchId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getMatchGames(matchId: number): Promise<GameWithDetails[]> {
  // Get all games for this match
  const games = await db
    .select({
      id: gamesTable.id,
      comment: gamesTable.comment,
    })
    .from(gamesTable)
    .where(eq(gamesTable.matchId, matchId))
    .orderBy(gamesTable.createdAt);

  // For each game, get scores and marks
  const result: GameWithDetails[] = [];

  for (const game of games) {
    const scores = await db
      .select({
        playerId: gameScoresTable.playerId,
        playerName: playersTable.nickname,
        score: gameScoresTable.score,
      })
      .from(gameScoresTable)
      .innerJoin(playersTable, eq(gameScoresTable.playerId, playersTable.id))
      .where(eq(gameScoresTable.gameId, game.id));

    const marks = await db
      .select({
        id: marksTable.id,
        name: marksTable.name,
      })
      .from(gameMarksTable)
      .innerJoin(marksTable, eq(gameMarksTable.markId, marksTable.id))
      .where(eq(gameMarksTable.gameId, game.id));

    result.push({
      id: game.id,
      comment: game.comment,
      scores,
      marks,
    });
  }

  return result;
}
