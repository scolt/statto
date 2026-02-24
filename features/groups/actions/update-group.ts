"use server";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import {
  updateGroupById,
  findGroupMemberPlayerIds,
  removeGroupMembers,
  insertGroupMembers,
} from "../repository/groups.repository";

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
  await updateGroupById(groupId, {
    name: data.name.trim(),
    description: data.description?.trim() || null,
  });

  // Sync players: get current members
  const currentIds = await findGroupMemberPlayerIds(groupId);
  const newIds = data.playerIds;

  // Remove players that are no longer in the list
  const toRemove = currentIds.filter((id) => !newIds.includes(id));
  if (toRemove.length > 0) {
    await removeGroupMembers(groupId, toRemove);
  }

  // Add new players
  const toAdd = newIds.filter((id) => !currentIds.includes(id));
  if (toAdd.length > 0) {
    await insertGroupMembers(groupId, toAdd);
  }

  return { success: true };
}
