"use server";

import {
  findGameIdsByMatchIds,
  findMatchesByGroupIdWithinPeriod,
  findScoresByGameIds,
} from "../repository/matches.repository";

export type PeriodPlayerGames = {
  playerId: number;
  nickname: string;
  gamesPlayed: number;
};

export type PeriodPlayerMatches = {
  playerId: number;
  nickname: string;
  matchesPlayed: number;
};

export type PeriodPlayerWins = {
  playerId: number;
  nickname: string;
  wins: number;
};

export type GroupPeriodWrapupStats = {
  totalMatches: number;
  totalGames: number;
  matchesPlayedByPlayer: PeriodPlayerMatches[];
  gamesPlayedByPlayer: PeriodPlayerGames[];
  gameWinsByPlayer: PeriodPlayerWins[];
  totalPlaySeconds: number;
  averageGameSeconds: number;
  averageMatchSeconds: number;
};

export async function getGroupPeriodWrapupStats(
  groupId: number,
  periodStart: Date,
  periodEnd: Date
): Promise<GroupPeriodWrapupStats> {
  const matches = await findMatchesByGroupIdWithinPeriod(groupId, periodStart, periodEnd);

  if (matches.length === 0) {
    return {
      totalMatches: 0,
      totalGames: 0,
      matchesPlayedByPlayer: [],
      gamesPlayedByPlayer: [],
      gameWinsByPlayer: [],
      totalPlaySeconds: 0,
      averageGameSeconds: 0,
      averageMatchSeconds: 0,
    };
  }

  const matchIds = matches.map((match) => match.id);
  const games = await findGameIdsByMatchIds(matchIds);
  const gameIds = games.map((game) => game.id);
  const scores = gameIds.length > 0 ? await findScoresByGameIds(gameIds) : [];

  const totalPlaySeconds = matches.reduce((sum, match) => sum + Math.max(0, match.duration), 0);
  const totalGames = games.length;
  const averageMatchSeconds = matches.length > 0 ? Math.round(totalPlaySeconds / matches.length) : 0;
  const averageGameSeconds = totalGames > 0 ? Math.round(totalPlaySeconds / totalGames) : 0;

  const scoresByGame = new Map<number, typeof scores>();
  for (const score of scores) {
    const existing = scoresByGame.get(score.gameId) ?? [];
    existing.push(score);
    scoresByGame.set(score.gameId, existing);
  }

  const gamesPlayedByPlayer = new Map<number, PeriodPlayerGames>();
  const gameWinsByPlayer = new Map<number, PeriodPlayerWins>();
  const matchesByPlayer = new Map<number, Set<number>>();

  for (const game of games) {
    const gameScores = scoresByGame.get(game.id) ?? [];
    if (gameScores.length === 0) {
      continue;
    }

    for (const score of gameScores) {
      const existingGames = gamesPlayedByPlayer.get(score.playerId) ?? {
        playerId: score.playerId,
        nickname: score.playerName,
        gamesPlayed: 0,
      };
      existingGames.gamesPlayed += 1;
      gamesPlayedByPlayer.set(score.playerId, existingGames);

      if (!gameWinsByPlayer.has(score.playerId)) {
        gameWinsByPlayer.set(score.playerId, {
          playerId: score.playerId,
          nickname: score.playerName,
          wins: 0,
        });
      }

      const playedMatches = matchesByPlayer.get(score.playerId) ?? new Set<number>();
      playedMatches.add(game.matchId);
      matchesByPlayer.set(score.playerId, playedMatches);
    }

    const maxScore = Math.max(...gameScores.map((score) => score.score));
    const winners = gameScores.filter((score) => score.score === maxScore);
    const isClearWin = winners.length < gameScores.length;

    if (!isClearWin) {
      continue;
    }

    for (const winner of winners) {
      const winStats = gameWinsByPlayer.get(winner.playerId);
      if (winStats) {
        winStats.wins += 1;
      }
    }
  }

  const sortByCountThenName = <T extends { nickname: string }>(
    a: T,
    b: T,
    countSelector: (item: T) => number
  ) => {
    const countDiff = countSelector(b) - countSelector(a);
    if (countDiff !== 0) {
      return countDiff;
    }
    return a.nickname.localeCompare(b.nickname);
  };

  return {
    totalMatches: matches.length,
    totalGames,
    matchesPlayedByPlayer: Array.from(matchesByPlayer.entries())
      .map(([playerId, matchIds]) => ({
        playerId,
        nickname:
          gamesPlayedByPlayer.get(playerId)?.nickname ??
          gameWinsByPlayer.get(playerId)?.nickname ??
          "Player",
        matchesPlayed: matchIds.size,
      }))
      .sort((a, b) => sortByCountThenName(a, b, (item) => item.matchesPlayed)),
    gamesPlayedByPlayer: Array.from(gamesPlayedByPlayer.values()).sort((a, b) =>
      sortByCountThenName(a, b, (item) => item.gamesPlayed)
    ),
    gameWinsByPlayer: Array.from(gameWinsByPlayer.values()).sort((a, b) =>
      sortByCountThenName(a, b, (item) => item.wins)
    ),
    totalPlaySeconds,
    averageGameSeconds,
    averageMatchSeconds,
  };
}
