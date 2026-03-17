"use server";

import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import {
  findAllMarks,
  insertGame,
  insertGameScores,
  insertGameMarks,
  deleteGameById,
  updateGameComment,
  deleteGameScoresByGameId,
  deleteGameMarksByGameId,
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

export type UpdateGameInput = {
  gameId: number;
  scores: { playerId: number; score: number }[];
  markIds: number[];
  comment?: string;
};

export async function updateGame(input: UpdateGameInput): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await updateGameComment(input.gameId, input.comment?.trim() || null);

  await deleteGameScoresByGameId(input.gameId);
  if (input.scores.length > 0) {
    await insertGameScores(input.gameId, input.scores);
  }

  await deleteGameMarksByGameId(input.gameId);
  if (input.markIds.length > 0) {
    await insertGameMarks(input.gameId, input.markIds);
  }
}
