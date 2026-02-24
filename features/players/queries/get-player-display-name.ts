"use server";

import {
  findUserByExternalId,
  findPlayerByUserId,
} from "../repository/players.repository";

/**
 * Gets the display name for a player by their Auth0 external ID.
 * Falls back to the provided default name if no player record exists.
 */
export async function getPlayerDisplayName(
  externalId: string,
  fallbackName: string
): Promise<string> {
  const dbUser = await findUserByExternalId(externalId);
  if (!dbUser) return fallbackName;

  const player = await findPlayerByUserId(dbUser.id);
  if (!player) return fallbackName;

  return player.nickname || fallbackName;
}
