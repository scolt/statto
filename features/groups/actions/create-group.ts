"use server";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import {
  insertGroup,
  insertGroupMembers,
  findUserIdByExternalId,
  findPlayerIdByUserId,
} from "../repository/groups.repository";

export type CreateGroupState = {
  error?: string;
  success?: boolean;
};

export async function createGroup(
  _prevState: CreateGroupState | Record<string, never>,
  formData: FormData
): Promise<CreateGroupState> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const playerIdsRaw = formData.get("playerIds") as string;
  const sportIdRaw = formData.get("sportId") as string;

  if (!name || name.trim().length === 0) {
    return { error: "Group name is required." };
  }

  // Find the current player
  const userId = await findUserIdByExternalId(session.user.sub);
  if (!userId) {
    return { error: "User not found. Please log in again." };
  }

  const currentPlayerId = await findPlayerIdByUserId(userId);
  if (!currentPlayerId) {
    return { error: "Player profile not found." };
  }

  // Parse selected player IDs
  let memberPlayerIds: number[] = [];
  if (playerIdsRaw) {
    try {
      memberPlayerIds = JSON.parse(playerIdsRaw) as number[];
    } catch {
      return { error: "Invalid player selection." };
    }
  }

  // Always include the creator
  if (!memberPlayerIds.includes(currentPlayerId)) {
    memberPlayerIds.push(currentPlayerId);
  }

  // Create the group
  const groupId = await insertGroup({
    name: name.trim(),
    description: description?.trim() || null,
    sportId: sportIdRaw ? Number(sportIdRaw) : null,
  });

  // Add all members to the group
  if (memberPlayerIds.length > 0) {
    await insertGroupMembers(groupId, memberPlayerIds);
  }

  redirect("/");
}
