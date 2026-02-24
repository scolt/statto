"use server";

import {
  getMatchIdsByGroupId,
  getGameIdsByMatchId,
  getScoresByGameIds,
} from "@/features/matches";

export type PlayerStats = {
  playerId: number;
  nickname: string;
  matchWins: number;
  totalGames: number;
  gameWins: number;
  totalPoints: number;
};

export async function getGroupPlayerStats(
  groupId: number
): Promise<PlayerStats[]> {
  const matches = await getMatchIdsByGroupId(groupId);

  if (matches.length === 0) return [];

  const statsMap = new Map<number, PlayerStats>();

  for (const match of matches) {
    const matchResults = await computeMatchPlayerData(match.id);
    if (matchResults.length === 0) continue;

    // Determine match winner(s) — draws count for all tied players
    const maxWins = Math.max(...matchResults.map((r) => r.gameWins));
    const topPlayers = matchResults.filter((r) => r.gameWins === maxWins);
    const isMatchDraw = topPlayers.length === matchResults.length && maxWins === 0
      ? false // no games = no winner
      : topPlayers.length > 1 || topPlayers.length === matchResults.length;

    for (const result of matchResults) {
      const existing = statsMap.get(result.playerId) ?? {
        playerId: result.playerId,
        nickname: result.nickname,
        matchWins: 0,
        totalGames: 0,
        gameWins: 0,
        totalPoints: 0,
      };

      // Match wins: winner gets 1, draw = all get 1
      const isWinner = result.gameWins === maxWins && maxWins > 0;
      if (isMatchDraw && maxWins > 0) {
        existing.matchWins++;
      } else if (isWinner && topPlayers.length === 1) {
        existing.matchWins++;
      }

      existing.totalGames += result.totalGames;
      existing.gameWins += result.gameWins;
      existing.totalPoints += result.totalPoints;

      statsMap.set(result.playerId, existing);
    }
  }

  // Sort by match wins desc, then game wins, then total points
  return Array.from(statsMap.values()).sort((a, b) => {
    if (b.matchWins !== a.matchWins) return b.matchWins - a.matchWins;
    if (b.gameWins !== a.gameWins) return b.gameWins - a.gameWins;
    return b.totalPoints - a.totalPoints;
  });
}

type MatchPlayerData = {
  playerId: number;
  nickname: string;
  gameWins: number;
  totalGames: number;
  totalPoints: number;
};

async function computeMatchPlayerData(
  matchId: number
): Promise<MatchPlayerData[]> {
  const games = await getGameIdsByMatchId(matchId);

  if (games.length === 0) return [];

  const gameIds = games.map((g) => g.id);
  const allScores = await getScoresByGameIds(gameIds);

  // Group scores by game
  const scoresByGame = new Map<number, typeof allScores>();
  for (const s of allScores) {
    const arr = scoresByGame.get(s.gameId) ?? [];
    arr.push(s);
    scoresByGame.set(s.gameId, arr);
  }

  // Aggregate per player
  const playerMap = new Map<number, MatchPlayerData>();

  for (const s of allScores) {
    if (!playerMap.has(s.playerId)) {
      playerMap.set(s.playerId, {
        playerId: s.playerId,
        nickname: s.playerName,
        gameWins: 0,
        totalGames: 0,
        totalPoints: 0,
      });
    }
  }

  for (const [, scores] of scoresByGame) {
    if (scores.length < 2) continue;

    const maxScore = Math.max(...scores.map((s) => s.score));
    const winners = scores.filter((s) => s.score === maxScore);
    const isClearWin = winners.length < scores.length;

    for (const s of scores) {
      const player = playerMap.get(s.playerId)!;
      player.totalGames++;
      player.totalPoints += s.score;

      if (isClearWin && s.score === maxScore) {
        player.gameWins++;
      }
    }
  }

  return Array.from(playerMap.values());
}
