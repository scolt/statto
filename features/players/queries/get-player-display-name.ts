"use server";

import { findPlayerNicknameByExternalId } from "../repository/players.repository";

/**
 * Gets the display name for a player by their Auth0 external ID.
 * Falls back to the provided default name if no player record exists.
 * Uses a single JOIN query instead of 2 sequential lookups.
 */
export async function getPlayerDisplayName(
  externalId: string,
  fallbackName: string
): Promise<string> {
  const nickname = await findPlayerNicknameByExternalId(externalId);
  return nickname || fallbackName;
}
