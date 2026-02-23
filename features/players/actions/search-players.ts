"use server";

import { db } from "@/lib/db";
import { playersTable } from "@/lib/db/schemas/players";
import { usersTable } from "@/lib/db/schemas/users";
import { like, or, eq } from "drizzle-orm";

export type PlayerSearchResult = {
  id: number;
  nickname: string;
  username: string;
};

export async function searchPlayers(
  query: string
): Promise<PlayerSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const pattern = `%${query.trim()}%`;

  const results = await db
    .select({
      id: playersTable.id,
      nickname: playersTable.nickname,
      username: usersTable.name,
    })
    .from(playersTable)
    .innerJoin(usersTable, eq(playersTable.userId, usersTable.id))
    .where(
      or(
        like(usersTable.name, pattern),
        like(playersTable.nickname, pattern)
      )
    )
    .limit(10);

  return results;
}
