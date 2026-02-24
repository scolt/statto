"use server";

import {
  findMatchById,
  findGamesByMatchId,
  findScoresByGameId,
  findMarksByGameId,
} from "../repository/matches.repository";

export type MatchStatus = "new" | "in_progress" | "done";

export type MatchDetail = {
  id: number;
  groupId: number;
  date: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  status: MatchStatus;
  comment: string | null;
};

export type GameWithDetails = {
  id: number;
  comment: string | null;
  scores: { playerId: number; playerName: string; score: number }[];
  marks: { id: number; name: string }[];
};

export async function getMatchById(matchId: number): Promise<MatchDetail | null> {
  return findMatchById(matchId);
}

export async function getMatchGames(matchId: number): Promise<GameWithDetails[]> {
  const games = await findGamesByMatchId(matchId);

  const result: GameWithDetails[] = [];

  for (const game of games) {
    const scores = await findScoresByGameId(game.id);
    const marks = await findMarksByGameId(game.id);

    result.push({
      id: game.id,
      comment: game.comment,
      scores,
      marks,
    });
  }

  return result;
}
