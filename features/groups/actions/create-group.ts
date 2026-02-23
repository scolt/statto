"use server";

import { db } from "@/lib/db";
import { groupsTable } from "@/lib/db/schemas/groups";
import { playersGroupsTable } from "@/lib/db/schemas/players-groups";
import { playersTable } from "@/lib/db/schemas/players";
import { usersTable } from "@/lib/db/schemas/users";
import { eq } from "drizzle-orm";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

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

  if (!name || name.trim().length === 0) {
    return { error: "Group name is required." };
  }

  // Find the current player
  const currentUser = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.externalId, session.user.sub))
    .limit(1);

  if (currentUser.length === 0) {
    return { error: "User not found. Please log in again." };
  }

  const currentPlayer = await db
    .select({ id: playersTable.id })
    .from(playersTable)
    .where(eq(playersTable.userId, currentUser[0].id))
    .limit(1);

  if (currentPlayer.length === 0) {
    return { error: "Player profile not found." };
  }

  const currentPlayerId = currentPlayer[0].id;

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
  const [result] = await db.insert(groupsTable).values({
    name: name.trim(),
    description: description?.trim() || null,
  });

  const groupId = result.insertId;

  // Add all members to the group
  if (memberPlayerIds.length > 0) {
    await db.insert(playersGroupsTable).values(
      memberPlayerIds.map((playerId) => ({
        playerId,
        groupId,
      }))
    );
  }

  redirect("/");
}
