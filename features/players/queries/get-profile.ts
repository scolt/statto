"use server";

import { findFullProfileByExternalId } from "../repository/players.repository";

export type UserProfile = {
  userId: number;
  playerId: number;
  name: string;
  nickname: string;
  provider: string | null;
  createdAt: Date | null;
  favouriteSports: string[];
};

/**
 * Gets the full user profile by Auth0 external ID.
 * Uses a single JOIN query instead of 2 sequential lookups.
 */
export async function getProfile(
  externalId: string
): Promise<UserProfile | null> {
  const row = await findFullProfileByExternalId(externalId);
  if (!row) return null;

  return {
    userId: row.userId,
    playerId: row.playerId,
    name: row.name,
    nickname: row.nickname,
    provider: row.provider,
    createdAt: row.createdAt,
    favouriteSports: row.favouriteSports
      ? JSON.parse(row.favouriteSports)
      : [],
  };
}
