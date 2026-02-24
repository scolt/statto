"use server";

import {
  findAllMarks,
  insertGame,
  insertGameScores,
  insertGameMarks,
  deleteGameById,
} from "../repository/matches.repository";

export type Mark = {
  id: number;
  name: string;
};

export async function getAllMarks(): Promise<Mark[]> {
  return findAllMarks();
}

export type ReportGameInput = {
  matchId: number;
  scores: { playerId: number; score: number }[];
  markIds: number[];
  comment?: string;
};

export async function deleteGame(gameId: number): Promise<void> {
  await deleteGameById(gameId);
}

export async function reportGame(input: ReportGameInput): Promise<number> {
  const gameId = await insertGame(input.matchId, input.comment || null);

  if (input.scores.length > 0) {
    await insertGameScores(gameId, input.scores);
  }

  if (input.markIds.length > 0) {
    await insertGameMarks(gameId, input.markIds);
  }

  return gameId;
}
