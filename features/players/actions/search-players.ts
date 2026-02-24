"use server";

import { searchPlayersByQuery } from "../repository/players.repository";

export type PlayerSearchResult = {
  id: number;
  nickname: string;
  username: string;
};

export async function searchPlayers(
  query: string
): Promise<PlayerSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const pattern = `%${query.trim()}%`;
  return searchPlayersByQuery(pattern, 10);
}
