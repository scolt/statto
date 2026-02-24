"use server";

import {
  findMatchIdsByGroupId,
  findGameIdsByMatchId,
  findScoresByGameIds,
} from "../repository/matches.repository";

export async function getMatchIdsByGroupId(
  groupId: number
): Promise<{ id: number }[]> {
  return findMatchIdsByGroupId(groupId);
}

export async function getGameIdsByMatchId(
  matchId: number
): Promise<{ id: number }[]> {
  return findGameIdsByMatchId(matchId);
}

export type GameScore = {
  gameId: number;
  playerId: number;
  playerName: string;
  score: number;
};

export async function getScoresByGameIds(
  gameIds: number[]
): Promise<GameScore[]> {
  return findScoresByGameIds(gameIds);
}
