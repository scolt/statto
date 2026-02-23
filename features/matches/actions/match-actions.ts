"use server";

import { db } from "@/lib/db";
import { matchesTable } from "@/lib/db/schemas/matches";
import { matchPlayersTable } from "@/lib/db/schemas/match-players";
import { playersTable } from "@/lib/db/schemas/players";
import { auth0 } from "@/lib/auth0";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function createMatch(groupId: number): Promise<number> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const [result] = await db.insert(matchesTable).values({
    groupId,
    date: new Date(),
    status: "new",
  });

  return result.insertId;
}

export async function startMatch(matchId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await db
    .update(matchesTable)
    .set({ status: "in_progress", startedAt: new Date() })
    .where(eq(matchesTable.id, matchId));
}

export async function completeMatch(matchId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await db
    .update(matchesTable)
    .set({ status: "done" })
    .where(eq(matchesTable.id, matchId));
}

export async function uncompleteMatch(matchId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  await db
    .update(matchesTable)
    .set({ status: "in_progress" })
    .where(eq(matchesTable.id, matchId));
}

export async function addPlayersToMatch(
  matchId: number,
  playerIds: number[]
): Promise<void> {
  if (playerIds.length === 0) return;

  await db.insert(matchPlayersTable).values(
    playerIds.map((playerId) => ({
      matchId,
      playerId,
    }))
  );
}

export type MatchPlayer = {
  id: number;
  nickname: string;
};

export async function getMatchPlayers(matchId: number): Promise<MatchPlayer[]> {
  const rows = await db
    .select({
      id: playersTable.id,
      nickname: playersTable.nickname,
    })
    .from(playersTable)
    .innerJoin(matchPlayersTable, eq(playersTable.id, matchPlayersTable.playerId))
    .where(eq(matchPlayersTable.matchId, matchId));

  return rows;
}
