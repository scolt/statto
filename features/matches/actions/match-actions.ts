"use server";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import {
  insertMatch,
  updateMatchStatus,
  insertMatchPlayers,
  findMatchPlayers,
} from "../repository/matches.repository";

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

export async function completeMatch(matchId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await updateMatchStatus(matchId, {
    status: "done",
    finishedAt: new Date(),
  });
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
