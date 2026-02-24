"use server";

import { findGroupsByUserExternalId } from "../repository/groups.repository";

export type GroupCard = {
  id: number;
  name: string;
  description: string | null;
};

export async function getGroupsForUser(auth0Id: string): Promise<GroupCard[]> {
  return findGroupsByUserExternalId(auth0Id);
}
