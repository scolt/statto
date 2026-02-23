"use server";

import { db } from "@/lib/db";
import { groupsTable } from "@/lib/db/schemas/groups";
import { playersGroupsTable } from "@/lib/db/schemas/players-groups";
import { playersTable } from "@/lib/db/schemas/players";
import { eq } from "drizzle-orm";
import { usersTable } from "@/lib/db/schemas/users";

export type GroupDetail = {
  id: number;
  name: string;
  description: string | null;
};

export type GroupMember = {
  id: number;
  nickname: string;
};

export async function getGroupById(groupId: number): Promise<GroupDetail | null> {
  const rows = await db
    .select({
      id: groupsTable.id,
      name: groupsTable.name,
      description: groupsTable.description,
    })
    .from(groupsTable)
    .where(eq(groupsTable.id, groupId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getGroupMembers(groupId: number): Promise<GroupMember[]> {
  const rows = await db
    .select({
      id: playersTable.id,
      nickname: playersTable.nickname,
    })
    .from(playersTable)
    .innerJoin(playersGroupsTable, eq(playersTable.id, playersGroupsTable.playerId))
    .where(eq(playersGroupsTable.groupId, groupId));

  return rows;
}

export type GroupMemberWithUsername = {
  id: number;
  nickname: string;
  username: string;
};

export async function getGroupMembersWithUsername(
  groupId: number
): Promise<GroupMemberWithUsername[]> {
  const rows = await db
    .select({
      id: playersTable.id,
      nickname: playersTable.nickname,
      username: usersTable.name,
    })
    .from(playersTable)
    .innerJoin(playersGroupsTable, eq(playersTable.id, playersGroupsTable.playerId))
    .innerJoin(usersTable, eq(playersTable.userId, usersTable.id))
    .where(eq(playersGroupsTable.groupId, groupId));

  return rows;
}
