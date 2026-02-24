"use server";

import {
  findGroupById,
  findGroupMembers,
  findGroupMembersWithUsername,
} from "../repository/groups.repository";

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
  return findGroupById(groupId);
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
