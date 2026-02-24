"use server";

import {
  findMatchesByGroupId,
  findGameIdsByMatchId,
  findScoresByGameIds,
} from "../repository/matches.repository";

export type PlayerMatchResult = {
  playerId: number;
  nickname: string;
  wins: number;
  isWinner: boolean;
};

export type MatchListItem = {
  id: number;
  date: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  status: "new" | "in_progress" | "done";
  comment: string | null;
  playerResults: PlayerMatchResult[];
};

export async function getMatchesForGroup(
  groupId: number
): Promise<MatchListItem[]> {
  const matches = await findMatchesByGroupId(groupId);

  const result: MatchListItem[] = [];

  for (const match of matches) {
    const playerResults = await computePlayerResults(match.id);
    result.push({ ...match, playerResults });
  }

  return result;
}

async function computePlayerResults(
  matchId: number
): Promise<PlayerMatchResult[]> {
  const games = await findGameIdsByMatchId(matchId);

  if (games.length === 0) return [];

  const gameIds = games.map((g) => g.id);
  const allScores = await findScoresByGameIds(gameIds);

  // Group scores by game
  const scoresByGame = new Map<number, typeof allScores>();
  for (const s of allScores) {
    const arr = scoresByGame.get(s.gameId) ?? [];
    arr.push(s);
    scoresByGame.set(s.gameId, arr);
  }

  // Count wins per player
  const winsMap = new Map<number, { nickname: string; wins: number }>();

  // Ensure all players appear even with 0 wins
  for (const s of allScores) {
    if (!winsMap.has(s.playerId)) {
      winsMap.set(s.playerId, { nickname: s.playerName, wins: 0 });
    }
  }

  for (const [, scores] of scoresByGame) {
    if (scores.length < 2) continue;
    const maxScore = Math.max(...scores.map((s) => s.score));
    const winners = scores.filter((s) => s.score === maxScore);

    // Only count if there is a clear winner (not a draw)
    if (winners.length < scores.length) {
      for (const w of winners) {
        const existing = winsMap.get(w.playerId)!;
        existing.wins++;
      }
    }
  }

  // Sort by wins desc
  const sorted = Array.from(winsMap.entries())
    .map(([playerId, { nickname, wins }]) => ({ playerId, nickname, wins }))
    .sort((a, b) => b.wins - a.wins);

  // Determine winner: top player if they have more wins than 2nd place
  const hasWinner =
    sorted.length >= 2 && sorted[0].wins > sorted[1].wins && sorted[0].wins > 0;

  return sorted.map((p, idx) => ({
    playerId: p.playerId,
    nickname: p.nickname,
    wins: p.wins,
    isWinner: idx === 0 || !hasWinner,
  }));
}
