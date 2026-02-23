"use server";

import { db } from "@/lib/db";
import { groupsTable } from "@/lib/db/schemas/groups";
import { playersGroupsTable } from "@/lib/db/schemas/players-groups";
import { eq, and, notInArray, inArray } from "drizzle-orm";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export type UpdateGroupState = {
  error?: string;
  success?: boolean;
};

export async function updateGroup(
  groupId: number,
  data: { name: string; description: string; playerIds: number[] }
): Promise<UpdateGroupState> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  if (!data.name || data.name.trim().length === 0) {
    return { error: "Group name is required." };
  }

  // Update the group details
  await db
    .update(groupsTable)
    .set({
      name: data.name.trim(),
      description: data.description?.trim() || null,
    })
    .where(eq(groupsTable.id, groupId));

  // Sync players: get current members
  const currentMembers = await db
    .select({ playerId: playersGroupsTable.playerId })
    .from(playersGroupsTable)
    .where(eq(playersGroupsTable.groupId, groupId));

  const currentIds = currentMembers.map((m) => m.playerId);
  const newIds = data.playerIds;

  // Remove players that are no longer in the list
  const toRemove = currentIds.filter((id) => !newIds.includes(id));
  if (toRemove.length > 0) {
    await db
      .delete(playersGroupsTable)
      .where(
        and(
          eq(playersGroupsTable.groupId, groupId),
          inArray(playersGroupsTable.playerId, toRemove)
        )
      );
  }

  // Add new players
  const toAdd = newIds.filter((id) => !currentIds.includes(id));
  if (toAdd.length > 0) {
    await db.insert(playersGroupsTable).values(
      toAdd.map((playerId) => ({
        playerId,
        groupId,
      }))
    );
  }

  return { success: true };
}
