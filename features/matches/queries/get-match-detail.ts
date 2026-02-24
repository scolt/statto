"use server";

import {
  findMatchById,
  findGamesByMatchId,
  findScoresByGameIds,
  findMarksByGameIds,
} from "../repository/matches.repository";

export type MatchStatus = "new" | "in_progress" | "done";

export type MatchDetail = {
  id: number;
  groupId: number;
  date: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
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
  return findMatchById(matchId);
}

/**
 * Fetches all games for a match with their scores and marks.
 * Uses batch queries instead of N+1: 1 query for games + 1 for all scores + 1 for all marks.
 */
export async function getMatchGames(matchId: number): Promise<GameWithDetails[]> {
  const games = await findGamesByMatchId(matchId);
  if (games.length === 0) return [];

  const gameIds = games.map((g) => g.id);

  // Batch: fetch all scores and marks in parallel (2 queries instead of 2*N)
  const [allScores, allMarks] = await Promise.all([
    findScoresByGameIds(gameIds),
    findMarksByGameIds(gameIds),
  ]);

  // Group by gameId
  const scoresByGame = new Map<number, GameWithDetails["scores"]>();
  for (const s of allScores) {
    const arr = scoresByGame.get(s.gameId) ?? [];
    arr.push({ playerId: s.playerId, playerName: s.playerName, score: s.score });
    scoresByGame.set(s.gameId, arr);
  }

  const marksByGame = new Map<number, GameWithDetails["marks"]>();
  for (const m of allMarks) {
    const arr = marksByGame.get(m.gameId) ?? [];
    arr.push({ id: m.id, name: m.name });
    marksByGame.set(m.gameId, arr);
  }

  return games.map((game) => ({
    id: game.id,
    comment: game.comment,
    scores: scoresByGame.get(game.id) ?? [],
    marks: marksByGame.get(game.id) ?? [],
  }));
}
