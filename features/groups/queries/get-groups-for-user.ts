import { db } from "@/lib/db";
import { groupsTable } from "@/lib/db/schemas/groups";
import { playersGroupsTable } from "@/lib/db/schemas/players-groups";
import { playersTable } from "@/lib/db/schemas/players";
import { usersTable } from "@/lib/db/schemas/users";
import { eq } from "drizzle-orm";

export type GroupCard = {
  id: number;
  name: string;
  description: string | null;
};

export async function getGroupsForUser(auth0Id: string): Promise<GroupCard[]> {
  // Find user → player → groups via junction table
  const rows = await db
    .select({
      id: groupsTable.id,
      name: groupsTable.name,
      description: groupsTable.description,
    })
    .from(groupsTable)
    .innerJoin(
      playersGroupsTable,
      eq(groupsTable.id, playersGroupsTable.groupId)
    )
    .innerJoin(playersTable, eq(playersGroupsTable.playerId, playersTable.id))
    .innerJoin(usersTable, eq(playersTable.userId, usersTable.id))
    .where(eq(usersTable.externalId, auth0Id));

  return rows;
}
