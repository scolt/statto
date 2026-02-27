"use server";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import {
  insertMatch,
  updateMatchStatus,
  updateMatchComment,
  insertMatchPlayers,
  findMatchPlayers,
  findMatchById,
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

  const now = new Date();
  await updateMatchStatus(matchId, {
    status: "in_progress",
    startedAt: now,
    duration: 0,
    timerStartedAt: now,
  });
}

export async function pauseMatch(matchId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const match = await findMatchById(matchId);
  if (!match || match.status !== "in_progress") return;

  // Add the current running-segment to the stored duration
  const segmentSeconds = match.timerStartedAt
    ? Math.floor((Date.now() - match.timerStartedAt.getTime()) / 1000)
    : 0;

  await updateMatchStatus(matchId, {
    status: "paused",
    duration: (match.duration ?? 0) + segmentSeconds,
    timerStartedAt: null,
  });
}

export async function resumeMatch(matchId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const match = await findMatchById(matchId);
  if (!match || match.status !== "paused") return;

  await updateMatchStatus(matchId, {
    status: "in_progress",
    timerStartedAt: new Date(),
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

  const match = await findMatchById(matchId);

  // Flush any running segment into duration before completing
  const segmentSeconds =
    match?.timerStartedAt
      ? Math.floor((Date.now() - match.timerStartedAt.getTime()) / 1000)
      : 0;

  await updateMatchStatus(matchId, {
    status: "done",
    finishedAt: new Date(),
    duration: (match?.duration ?? 0) + segmentSeconds,
    timerStartedAt: null,
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

  // Resume the timer from where it was left off
  await updateMatchStatus(matchId, {
    status: "in_progress",
    finishedAt: null,
    timerStartedAt: new Date(),
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
