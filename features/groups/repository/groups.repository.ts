import { db } from "@/lib/db";
import { groupsTable } from "@/lib/db/schemas/groups";
import { playersGroupsTable } from "@/lib/db/schemas/players-groups";
import { playersTable } from "@/lib/db/schemas/players";
import { usersTable } from "@/lib/db/schemas/users";
import { sportsTable } from "@/lib/db/schemas/sports";
import { eq, and, inArray } from "drizzle-orm";

// --- Group CRUD ---

export async function insertGroup(data: {
  name: string;
  description: string | null;
  sportId: number | null;
}): Promise<number> {
  const [result] = await db.insert(groupsTable).values(data);
  return result.insertId;
}

export async function updateGroupById(
  groupId: number,
  data: { name: string; description: string | null; sportId: number | null }
): Promise<void> {
  await db
    .update(groupsTable)
    .set(data)
    .where(eq(groupsTable.id, groupId));
}

export async function deleteGroupById(groupId: number): Promise<void> {
  await db.delete(groupsTable).where(eq(groupsTable.id, groupId));
}

export async function findGroupById(groupId: number) {
  const rows = await db
    .select({
      id: groupsTable.id,
      name: groupsTable.name,
      description: groupsTable.description,
      sport: {
        id: sportsTable.id,
        name: sportsTable.name,
        slug: sportsTable.slug,
        icon: sportsTable.icon,
      },
    })
    .from(groupsTable)
    .leftJoin(sportsTable, eq(groupsTable.sportId, sportsTable.id))
    .where(eq(groupsTable.id, groupId))
    .limit(1);

  return rows[0] ?? null;
}

// --- Group Members ---

export async function findGroupMembers(groupId: number) {
  return db
    .select({
      id: playersTable.id,
      nickname: playersTable.nickname,
    })
    .from(playersTable)
    .innerJoin(playersGroupsTable, eq(playersTable.id, playersGroupsTable.playerId))
    .where(eq(playersGroupsTable.groupId, groupId));
}

export async function findGroupMembersWithUsername(groupId: number) {
  return db
    .select({
      id: playersTable.id,
      nickname: playersTable.nickname,
      username: usersTable.name,
    })
    .from(playersTable)
    .innerJoin(playersGroupsTable, eq(playersTable.id, playersGroupsTable.playerId))
    .innerJoin(usersTable, eq(playersTable.userId, usersTable.id))
    .where(eq(playersGroupsTable.groupId, groupId));
}

export async function findGroupsByUserExternalId(externalId: string) {
  return db
    .select({
      id: groupsTable.id,
      name: groupsTable.name,
      description: groupsTable.description,
      sport: {
        id: sportsTable.id,
        name: sportsTable.name,
        slug: sportsTable.slug,
        icon: sportsTable.icon,
      },
    })
    .from(groupsTable)
    .innerJoin(
      playersGroupsTable,
      eq(groupsTable.id, playersGroupsTable.groupId)
    )
    .innerJoin(playersTable, eq(playersGroupsTable.playerId, playersTable.id))
    .innerJoin(usersTable, eq(playersTable.userId, usersTable.id))
    .leftJoin(sportsTable, eq(groupsTable.sportId, sportsTable.id))
    .where(eq(usersTable.externalId, externalId));
}

export async function findGroupMemberPlayerIds(
  groupId: number
): Promise<number[]> {
  const rows = await db
    .select({ playerId: playersGroupsTable.playerId })
    .from(playersGroupsTable)
    .where(eq(playersGroupsTable.groupId, groupId));

  return rows.map((m) => m.playerId);
}

export async function insertGroupMembers(
  groupId: number,
  playerIds: number[]
): Promise<void> {
  await db.insert(playersGroupsTable).values(
    playerIds.map((playerId) => ({
      playerId,
      groupId,
    }))
  );
}

export async function removeGroupMembers(
  groupId: number,
  playerIds: number[]
): Promise<void> {
  await db
    .delete(playersGroupsTable)
    .where(
      and(
        eq(playersGroupsTable.groupId, groupId),
        inArray(playersGroupsTable.playerId, playerIds)
      )
    );
}

// --- User/Player lookup for group creation ---

export async function findUserIdByExternalId(
  externalId: string
): Promise<number | null> {
  const rows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.externalId, externalId))
    .limit(1);

  return rows[0]?.id ?? null;
}

export async function findPlayerIdByUserId(
  userId: number
): Promise<number | null> {
  const rows = await db
    .select({ id: playersTable.id })
    .from(playersTable)
    .where(eq(playersTable.userId, userId))
    .limit(1);

  return rows[0]?.id ?? null;
}
