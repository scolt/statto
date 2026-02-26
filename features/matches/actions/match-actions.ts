"use server";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import {
  insertMatch,
  updateMatchStatus,
  updateMatchComment,
  insertMatchPlayers,
  findMatchPlayers,
  findGamesByMatchId,
  findScoresByGameIds,
  findMarksByGameIds
} from "../repository/matches.repository";
import { generateMatchComment } from "@/lib/services/openai.service";

export async function createMatch(groupId: number): Promise<number> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return insertMatch(groupId);
}

export async function startMatch(matchId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await updateMatchStatus(matchId, {
    status: "in_progress",
    startedAt: new Date(),
  });
}

export async function completeMatch(
  matchId: number,
  comment?: string | null
): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await updateMatchStatus(matchId, {
    status: "done",
    finishedAt: new Date(),
    comment: comment?.trim() || null,
  });
}

export async function saveMatchComment(
  matchId: number,
  comment: string | null
): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await updateMatchComment(matchId, comment?.trim() || null);
}

export async function generateAIMatchComment(matchId: number): Promise<string> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Get match details
  const matchPlayers = await findMatchPlayers(matchId);
  const games = await findGamesByMatchId(matchId);

  // Get game details
  const gameIds = games.map(game => game.id);
  const allScores = gameIds.length > 0 ? await findScoresByGameIds(gameIds) : [];
  const allMarks = gameIds.length > 0 ? await findMarksByGameIds(gameIds) : [];

  // Organize data for the OpenAI prompt
  const gameDetails = games.map(game => {
    return {
      comment: game.comment,
      scores: allScores.filter(score => score.gameId === game.id),
      marks: allMarks.filter(mark => mark.gameId === game.id)
    };
  });

  // Generate comment
  const generatedComment = await generateMatchComment({
    players: matchPlayers,
    games: gameDetails,
    matchStatus: "completed",
  });

  // Save the generated comment
  await updateMatchComment(matchId, generatedComment);

  return generatedComment;
}

export async function uncompleteMatch(matchId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await updateMatchStatus(matchId, {
    status: "in_progress",
    finishedAt: null,
  });
}

export async function addPlayersToMatch(
  matchId: number,
  playerIds: number[]
): Promise<void> {
  if (playerIds.length === 0) return;
  await insertMatchPlayers(matchId, playerIds);
}

export type MatchPlayer = {
  id: number;
  nickname: string;
};

export async function getMatchPlayers(matchId: number): Promise<MatchPlayer[]> {
  return findMatchPlayers(matchId);
}
