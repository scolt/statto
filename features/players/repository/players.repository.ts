import { db } from "@/lib/db";
import { playersTable } from "@/lib/db/schemas/players";
import { usersTable } from "@/lib/db/schemas/users";
import { like, or, eq, and, ne } from "drizzle-orm";

export type PlayerSearchRow = {
  id: number;
  nickname: string;
  username: string;
};

export async function searchPlayersByQuery(
  pattern: string,
  limit: number
): Promise<PlayerSearchRow[]> {
  return db
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
    .limit(limit);
}

export async function findUserByExternalId(
  externalId: string
): Promise<{ id: number } | null> {
  const rows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.externalId, externalId))
    .limit(1);

  return rows[0] ?? null;
}

export async function findPlayerByUserId(
  userId: number
): Promise<{ nickname: string } | null> {
  const rows = await db
    .select({ nickname: playersTable.nickname })
    .from(playersTable)
    .where(eq(playersTable.userId, userId))
    .limit(1);

  return rows[0] ?? null;
}

export async function findFullPlayerByUserId(userId: number) {
  const rows = await db
    .select({
      id: playersTable.id,
      nickname: playersTable.nickname,
      favouriteSports: playersTable.favouriteSports,
    })
    .from(playersTable)
    .where(eq(playersTable.userId, userId))
    .limit(1);

  return rows[0] ?? null;
}

export async function findFullUserByExternalId(externalId: string) {
  const rows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      provider: usersTable.provider,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.externalId, externalId))
    .limit(1);

  return rows[0] ?? null;
}

export async function isNicknameTaken(
  nickname: string,
  excludePlayerId?: number
): Promise<boolean> {
  const conditions = [eq(playersTable.nickname, nickname)];
  if (excludePlayerId) {
    conditions.push(ne(playersTable.id, excludePlayerId));
  }

  const rows = await db
    .select({ id: playersTable.id })
    .from(playersTable)
    .where(and(...conditions))
    .limit(1);

  return rows.length > 0;
}

export async function updateUserName(
  userId: number,
  name: string
): Promise<void> {
  await db
    .update(usersTable)
    .set({ name })
    .where(eq(usersTable.id, userId));
}

export async function updatePlayerNickname(
  playerId: number,
  nickname: string
): Promise<void> {
  await db
    .update(playersTable)
    .set({ nickname })
    .where(eq(playersTable.id, playerId));
}

/**
 * Single-join query: get player nickname by external ID (replaces 2 sequential queries).
 */
export async function findPlayerNicknameByExternalId(
  externalId: string
): Promise<string | null> {
  const rows = await db
    .select({ nickname: playersTable.nickname })
    .from(playersTable)
    .innerJoin(usersTable, eq(playersTable.userId, usersTable.id))
    .where(eq(usersTable.externalId, externalId))
    .limit(1);

  return rows[0]?.nickname ?? null;
}

/**
 * Single-join query: get full profile by external ID (replaces 2 sequential queries).
 */
export async function findFullProfileByExternalId(externalId: string) {
  const rows = await db
    .select({
      userId: usersTable.id,
      playerId: playersTable.id,
      name: usersTable.name,
      nickname: playersTable.nickname,
      provider: usersTable.provider,
      createdAt: usersTable.createdAt,
      favouriteSports: playersTable.favouriteSports,
    })
    .from(usersTable)
    .innerJoin(playersTable, eq(playersTable.userId, usersTable.id))
    .where(eq(usersTable.externalId, externalId))
    .limit(1);

  return rows[0] ?? null;
}
