import { db } from "@/lib/db";
import { matchesTable } from "@/lib/db/schemas/matches";
import { matchPlayersTable } from "@/lib/db/schemas/match-players";
import { gamesTable } from "@/lib/db/schemas/games";
import { gameScoresTable } from "@/lib/db/schemas/game-scores";
import { gameMarksTable } from "@/lib/db/schemas/game-marks";
import { playersTable } from "@/lib/db/schemas/players";
import { marksTable } from "@/lib/db/schemas/marks";
import { eq, desc, inArray, sql } from "drizzle-orm";

// --- Match CRUD ---

export async function insertMatch(groupId: number): Promise<number> {
  const [result] = await db.insert(matchesTable).values({
    groupId,
    date: new Date(),
    status: "new",
  });
  return result.insertId;
}

export async function updateMatchStatus(
  matchId: number,
  data: {
    status: "new" | "in_progress" | "paused" | "done";
    startedAt?: Date | null;
    finishedAt?: Date | null;
    duration?: number;
    timerStartedAt?: Date | null;
    comment?: string | null;
  }
): Promise<void> {
  await db
    .update(matchesTable)
    .set(data)
    .where(eq(matchesTable.id, matchId));
}

export async function updateMatchComment(
  matchId: number,
  comment: string | null
): Promise<void> {
  await db
    .update(matchesTable)
    .set({ comment })
    .where(eq(matchesTable.id, matchId));
}

export async function deleteMatchById(matchId: number): Promise<void> {
  await db.delete(matchesTable).where(eq(matchesTable.id, matchId));
}

export async function findMatchById(matchId: number) {
  const rows = await db
    .select({
      id: matchesTable.id,
      groupId: matchesTable.groupId,
      date: matchesTable.date,
      startedAt: matchesTable.startedAt,
      finishedAt: matchesTable.finishedAt,
      duration: matchesTable.duration,
      timerStartedAt: matchesTable.timerStartedAt,
      status: matchesTable.status,
      comment: matchesTable.comment,
    })
    .from(matchesTable)
    .where(eq(matchesTable.id, matchId))
    .limit(1);

  return rows[0] ?? null;
}

export async function findMatchesByGroupId(groupId: number) {
  return db
    .select({
      id: matchesTable.id,
      date: matchesTable.date,
      startedAt: matchesTable.startedAt,
      finishedAt: matchesTable.finishedAt,
      duration: matchesTable.duration,
      status: matchesTable.status,
      comment: matchesTable.comment,
    })
    .from(matchesTable)
    .where(eq(matchesTable.groupId, groupId))
    .orderBy(desc(matchesTable.date));
}

export async function findMatchIdsByGroupId(
  groupId: number
): Promise<{ id: number }[]> {
  return db
    .select({ id: matchesTable.id })
    .from(matchesTable)
    .where(eq(matchesTable.groupId, groupId))
    .orderBy(desc(matchesTable.date));
}

// --- Match Players ---

export async function insertMatchPlayers(
  matchId: number,
  playerIds: number[]
): Promise<void> {
  await db.insert(matchPlayersTable).values(
    playerIds.map((playerId) => ({
      matchId,
      playerId,
    }))
  );
}

export async function findMatchPlayers(matchId: number) {
  return db
    .select({
      id: playersTable.id,
      nickname: playersTable.nickname,
    })
    .from(playersTable)
    .innerJoin(matchPlayersTable, eq(playersTable.id, matchPlayersTable.playerId))
    .where(eq(matchPlayersTable.matchId, matchId));
}

// --- Games ---

export async function findGameIdsByMatchId(
  matchId: number
): Promise<{ id: number }[]> {
  return db
    .select({ id: gamesTable.id })
    .from(gamesTable)
    .where(eq(gamesTable.matchId, matchId));
}

export async function findGamesByMatchId(matchId: number) {
  return db
    .select({
      id: gamesTable.id,
      comment: gamesTable.comment,
    })
    .from(gamesTable)
    .where(eq(gamesTable.matchId, matchId))
    .orderBy(gamesTable.createdAt);
}

export async function findScoresByGameIds(gameIds: number[]) {
  if (gameIds.length === 0) return [];
  return db
    .select({
      gameId: gameScoresTable.gameId,
      playerId: gameScoresTable.playerId,
      playerName: playersTable.nickname,
      score: gameScoresTable.score,
    })
    .from(gameScoresTable)
    .innerJoin(playersTable, eq(gameScoresTable.playerId, playersTable.id))
    .where(inArray(gameScoresTable.gameId, gameIds));
}

export async function findScoresByGameId(gameId: number) {
  return db
    .select({
      playerId: gameScoresTable.playerId,
      playerName: playersTable.nickname,
      score: gameScoresTable.score,
    })
    .from(gameScoresTable)
    .innerJoin(playersTable, eq(gameScoresTable.playerId, playersTable.id))
    .where(eq(gameScoresTable.gameId, gameId));
}

export async function findMarksByGameId(gameId: number) {
  return db
    .select({
      id: marksTable.id,
      name: marksTable.name,
    })
    .from(gameMarksTable)
    .innerJoin(marksTable, eq(gameMarksTable.markId, marksTable.id))
    .where(eq(gameMarksTable.gameId, gameId));
}

/**
 * Batch: find marks for multiple games at once (eliminates N+1).
 */
export async function findMarksByGameIds(gameIds: number[]) {
  if (gameIds.length === 0) return [];
  return db
    .select({
      gameId: gameMarksTable.gameId,
      id: marksTable.id,
      name: marksTable.name,
    })
    .from(gameMarksTable)
    .innerJoin(marksTable, eq(gameMarksTable.markId, marksTable.id))
    .where(inArray(gameMarksTable.gameId, gameIds));
}

/**
 * Batch: find all game IDs for multiple matches at once (eliminates N+1).
 */
export async function findGameIdsByMatchIds(matchIds: number[]) {
  if (matchIds.length === 0) return [];
  return db
    .select({
      id: gamesTable.id,
      matchId: gamesTable.matchId,
    })
    .from(gamesTable)
    .where(inArray(gamesTable.matchId, matchIds));
}

/**
 * Batch: find all games (with comments) for multiple matches at once.
 */
export async function findGamesByMatchIds(matchIds: number[]) {
  if (matchIds.length === 0) return [];
  return db
    .select({
      id: gamesTable.id,
      matchId: gamesTable.matchId,
      comment: gamesTable.comment,
    })
    .from(gamesTable)
    .where(inArray(gamesTable.matchId, matchIds))
    .orderBy(gamesTable.createdAt);
}

export async function insertGame(
  matchId: number,
  comment: string | null
): Promise<number> {
  const [result] = await db.insert(gamesTable).values({
    matchId,
    comment,
  });
  return result.insertId;
}

export async function insertGameScores(
  gameId: number,
  scores: { playerId: number; score: number }[]
): Promise<void> {
  await db.insert(gameScoresTable).values(
    scores.map((s) => ({
      gameId,
      playerId: s.playerId,
      score: s.score,
    }))
  );
}

export async function insertGameMarks(
  gameId: number,
  markIds: number[]
): Promise<void> {
  await db.insert(gameMarksTable).values(
    markIds.map((markId) => ({
      gameId,
      markId,
    }))
  );
}

export async function deleteGameById(gameId: number): Promise<void> {
  await db.delete(gamesTable).where(eq(gamesTable.id, gameId));
}

export async function findAllMarks() {
  return db
    .select({
      id: marksTable.id,
      name: marksTable.name,
    })
    .from(marksTable)
    .orderBy(marksTable.name);
}
