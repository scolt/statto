"use server";

import {
  findFullUserByExternalId,
  findFullPlayerByUserId,
} from "../repository/players.repository";

export type UserProfile = {
  userId: number;
  playerId: number;
  name: string;
  nickname: string;
  provider: string | null;
  createdAt: Date | null;
  favouriteSports: string[];
};

export async function getProfile(
  externalId: string
): Promise<UserProfile | null> {
  const user = await findFullUserByExternalId(externalId);
  if (!user) return null;

  const player = await findFullPlayerByUserId(user.id);
  if (!player) return null;

  return {
    userId: user.id,
    playerId: player.id,
    name: user.name,
    nickname: player.nickname,
    provider: user.provider,
    createdAt: user.createdAt,
    favouriteSports: player.favouriteSports
      ? JSON.parse(player.favouriteSports)
      : [],
  };
}
