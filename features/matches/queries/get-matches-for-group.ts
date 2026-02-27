"use server";

import {
  findMatchesByGroupId,
  findGameIdsByMatchIds,
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
  /** Accumulated timer duration in seconds. */
  duration: number;
  status: "new" | "in_progress" | "paused" | "done";
  comment: string | null;
  playerResults: PlayerMatchResult[];
};

/**
 * Fetches all matches for a group with computed player results.
 * Uses batch queries: 1 for matches + 1 for all games + 1 for all scores
 * instead of 2*N sequential queries.
 */
export async function getMatchesForGroup(
  groupId: number
): Promise<MatchListItem[]> {
  const matches = await findMatchesByGroupId(groupId);
  if (matches.length === 0) return [];

  const matchIds = matches.map((m) => m.id);

  // Batch: get all games for all matches in one query
  const allGames = await findGameIdsByMatchIds(matchIds);

  // Batch: get all scores for all games in one query
  const allGameIds = allGames.map((g) => g.id);
  const allScores = allGameIds.length > 0
    ? await findScoresByGameIds(allGameIds)
    : [];

  // Group games by matchId
  const gamesByMatch = new Map<number, { id: number }[]>();
  for (const g of allGames) {
    const arr = gamesByMatch.get(g.matchId) ?? [];
    arr.push({ id: g.id });
    gamesByMatch.set(g.matchId, arr);
  }

  // Group scores by gameId
  const scoresByGame = new Map<number, typeof allScores>();
  for (const s of allScores) {
    const arr = scoresByGame.get(s.gameId) ?? [];
    arr.push(s);
    scoresByGame.set(s.gameId, arr);
  }

  return matches.map((match) => {
    const matchGames = gamesByMatch.get(match.id) ?? [];
    const playerResults = computePlayerResults(matchGames, scoresByGame);
    return { ...match, playerResults };
  });
}

function computePlayerResults(
  games: { id: number }[],
  scoresByGame: Map<number, { gameId: number; playerId: number; playerName: string; score: number }[]>
): PlayerMatchResult[] {
  if (games.length === 0) return [];

  // Count wins per player
  const winsMap = new Map<number, { nickname: string; wins: number }>();

  for (const game of games) {
    const scores = scoresByGame.get(game.id) ?? [];
    if (scores.length < 2) continue;

    // Ensure all players appear even with 0 wins
    for (const s of scores) {
      if (!winsMap.has(s.playerId)) {
        winsMap.set(s.playerId, { nickname: s.playerName, wins: 0 });
      }
    }

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
