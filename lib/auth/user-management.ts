import { db } from '@/lib/db';
import { usersTable, playersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type Auth0User = {
  sub?: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
};

export type DbUser = typeof usersTable.$inferSelect;
export type DbPlayer = typeof playersTable.$inferSelect;

/**
 * Finds or creates a user in our database based on the Auth0 user profile.
 * Also creates a player profile for first-time users.
 */
export async function ensureUserAndPlayer(auth0User: Auth0User | undefined | null): Promise<{
  user: DbUser;
  player: DbPlayer;
} | null> {
  if (!auth0User?.sub) return null;

  const user = await findOrCreateUser(auth0User);
  const player = await findOrCreatePlayer(user.id, auth0User.nickname || auth0User.name || null);

  return { user, player };
}

async function findOrCreateUser(auth0User: Auth0User): Promise<DbUser> {
  const existingUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.externalId, auth0User.sub as string));

  if (existingUsers.length > 0) {
    return existingUsers[0];
  }

  // MySQL doesn't support .returning() — use insertId
  const result = await db.insert(usersTable).values({
    name: auth0User.name || auth0User.nickname || 'Anonymous User',
    externalId: auth0User.sub as string,
    provider: 'auth0',
  });

  const insertId = result[0].insertId;

  const [newUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, insertId));

  return newUser;
}

async function findOrCreatePlayer(userId: number, nickname: string | null): Promise<DbPlayer> {
  const existingPlayers = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.userId, userId));

  if (existingPlayers.length > 0) {
    return existingPlayers[0];
  }

  const result = await db.insert(playersTable).values({
    userId,
    nickname: nickname || `Player_${userId}`,
    favouriteSports: JSON.stringify([]),
  });

  const insertId = result[0].insertId;

  const [newPlayer] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, insertId));

  return newPlayer;
}

export async function updatePlayerProfile(
  playerId: number,
  data: { nickname?: string; favouriteSports?: string[] }
): Promise<DbPlayer> {
  const updateData: Partial<typeof playersTable.$inferInsert> = {};

  if (data.nickname) {
    updateData.nickname = data.nickname;
  }

  if (data.favouriteSports) {
    updateData.favouriteSports = JSON.stringify(data.favouriteSports);
  }

  await db
    .update(playersTable)
    .set(updateData)
    .where(eq(playersTable.id, playerId));

  const [updatedPlayer] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, playerId));

  return updatedPlayer;
}
