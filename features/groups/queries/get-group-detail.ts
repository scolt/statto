"use server";

import {
  findGroupById,
  findGroupMembers,
  findGroupMembersWithUsername,
} from "../repository/groups.repository";
import type { Sport } from "@/features/sports";

export type GroupDetail = {
  id: number;
  name: string;
  description: string | null;
  sport: Sport | null;
};

export type GroupMember = {
  id: number;
  nickname: string;
};

export async function getGroupById(groupId: number): Promise<GroupDetail | null> {
  const row = await findGroupById(groupId);
  if (!row) return null;
  // leftJoin returns null fields when no sport — normalise to null object
  const sport = row.sport?.id ? (row.sport as Sport) : null;
  return { ...row, sport };
}

export async function getGroupMembers(groupId: number): Promise<GroupMember[]> {
  return findGroupMembers(groupId);
}

export type GroupMemberWithUsername = {
  id: number;
  nickname: string;
  username: string;
};

export async function getGroupMembersWithUsername(
  groupId: number
): Promise<GroupMemberWithUsername[]> {
  return findGroupMembersWithUsername(groupId);
}
