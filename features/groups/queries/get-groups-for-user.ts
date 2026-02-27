"use server";

import { findGroupsByUserExternalId } from "../repository/groups.repository";
import type { Sport } from "@/features/sports";

export type GroupCard = {
  id: number;
  name: string;
  description: string | null;
  sport: Sport | null;
};

export async function getGroupsForUser(auth0Id: string): Promise<GroupCard[]> {
  const rows = await findGroupsByUserExternalId(auth0Id);
  return rows.map((row) => ({
    ...row,
    sport: row.sport?.id ? (row.sport as Sport) : null,
  }));
}
