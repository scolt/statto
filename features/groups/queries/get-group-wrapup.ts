import {
  getGroupPeriodWrapupStats,
  type GroupPeriodWrapupStats,
} from "@/features/matches";

const WRAPUP_WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type WrapupType = "quarter" | "year";

export type GroupWrapupBannerState = {
  isActive: boolean;
  periodLabel: string | null;
  type: WrapupType | null;
};

export type WrapupStoryPage =
  | {
      id: "player-stats";
      totalMatches: number;
      players: {
        playerId: number;
        nickname: string;
        matchesPlayed: number;
        gamesPlayed: number;
        wins: number;
      }[];
    }
  | {
      id: "time";
      totalPlaySeconds: number;
      averageGameSeconds: number;
      averageMatchSeconds: number;
    }
  | {
      id: "efficiency-top-3";
      players: WrapupEfficiencyPlayer[];
    };

export type WrapupEfficiencyPlayer = {
  playerId: number;
  nickname: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  percentile: number;
};

export type ActiveGroupWrapup = {
  banner: GroupWrapupBannerState;
  periodStart: Date | null;
  periodEnd: Date | null;
  pages: WrapupStoryPage[];
};

export type WrapupCandidate = {
  type: WrapupType;
  boundary: Date;
  periodStart: Date;
  periodEnd: Date;
  periodLabel: string;
};

export async function getActiveGroupWrapup(groupId: number): Promise<ActiveGroupWrapup> {
  const now = new Date();
  const candidate = getWrapupCandidateForDate(now);

  if (!candidate) {
    return {
      banner: {
        isActive: false,
        periodLabel: null,
        type: null,
      },
      periodStart: null,
      periodEnd: null,
      pages: [],
    };
  }

  const stats = await getGroupPeriodWrapupStats(
    groupId,
    candidate.periodStart,
    candidate.periodEnd
  );

  const pages: WrapupStoryPage[] = [
    {
      id: "player-stats",
      totalMatches: stats.totalMatches,
      players: buildCombinedPlayerStats(stats),
    },
    {
      id: "time",
      totalPlaySeconds: stats.totalPlaySeconds,
      averageGameSeconds: stats.averageGameSeconds,
      averageMatchSeconds: stats.averageMatchSeconds,
    },
  ];

  if (candidate.type === "year") {
    pages.push({
      id: "efficiency-top-3",
      players: computeTopEfficiencyPlayers(stats),
    });
  }

  return {
    banner: {
      isActive: true,
      periodLabel: candidate.periodLabel,
      type: candidate.type,
    },
    periodStart: candidate.periodStart,
    periodEnd: candidate.periodEnd,
    pages,
  };
}

function buildCombinedPlayerStats(stats: GroupPeriodWrapupStats) {
  const gamesByPlayerId = new Map(
    stats.gamesPlayedByPlayer.map((player) => [player.playerId, player.gamesPlayed])
  );
  const winsByPlayerId = new Map(
    stats.gameWinsByPlayer.map((player) => [player.playerId, player.wins])
  );

  return stats.matchesPlayedByPlayer
    .map((player) => ({
      playerId: player.playerId,
      nickname: player.nickname,
      matchesPlayed: player.matchesPlayed,
      gamesPlayed: gamesByPlayerId.get(player.playerId) ?? 0,
      wins: winsByPlayerId.get(player.playerId) ?? 0,
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      if (b.gamesPlayed !== a.gamesPlayed) {
        return b.gamesPlayed - a.gamesPlayed;
      }
      if (b.matchesPlayed !== a.matchesPlayed) {
        return b.matchesPlayed - a.matchesPlayed;
      }
      return a.nickname.localeCompare(b.nickname);
    });
}

export function getWrapupCandidateForDate(now: Date): WrapupCandidate | null {
  const quarterCandidate = findClosestActiveCandidate(now, buildQuarterCandidates(now));
  const yearCandidate = findClosestActiveCandidate(now, buildYearCandidates(now));

  if (yearCandidate) {
    return yearCandidate;
  }

  return quarterCandidate;
}

function findClosestActiveCandidate(
  now: Date,
  candidates: WrapupCandidate[]
): WrapupCandidate | null {
  const nowMs = now.getTime();
  const activeCandidates = candidates.filter((candidate) => {
    const windowStart = candidate.boundary.getTime() - WRAPUP_WINDOW_DAYS * DAY_MS;
    const windowEnd = candidate.boundary.getTime() + WRAPUP_WINDOW_DAYS * DAY_MS;
    return nowMs >= windowStart && nowMs <= windowEnd;
  });

  if (activeCandidates.length === 0) {
    return null;
  }

  return activeCandidates.sort((a, b) => {
    const distanceA = Math.abs(a.boundary.getTime() - nowMs);
    const distanceB = Math.abs(b.boundary.getTime() - nowMs);
    return distanceA - distanceB;
  })[0];
}

function buildQuarterCandidates(now: Date): WrapupCandidate[] {
  const year = now.getUTCFullYear();
  const years = [year - 1, year, year + 1];
  const candidates: WrapupCandidate[] = [];

  for (const currentYear of years) {
    const januaryBoundary = new Date(Date.UTC(currentYear, 0, 1));
    candidates.push({
      type: "quarter",
      boundary: januaryBoundary,
      periodStart: new Date(Date.UTC(currentYear - 1, 9, 1)),
      periodEnd: januaryBoundary,
      periodLabel: `${currentYear - 1}Q4`,
    });

    const aprilBoundary = new Date(Date.UTC(currentYear, 3, 1));
    candidates.push({
      type: "quarter",
      boundary: aprilBoundary,
      periodStart: new Date(Date.UTC(currentYear, 0, 1)),
      periodEnd: aprilBoundary,
      periodLabel: `${currentYear}Q1`,
    });

    const julyBoundary = new Date(Date.UTC(currentYear, 6, 1));
    candidates.push({
      type: "quarter",
      boundary: julyBoundary,
      periodStart: new Date(Date.UTC(currentYear, 3, 1)),
      periodEnd: julyBoundary,
      periodLabel: `${currentYear}Q2`,
    });

    const octoberBoundary = new Date(Date.UTC(currentYear, 9, 1));
    candidates.push({
      type: "quarter",
      boundary: octoberBoundary,
      periodStart: new Date(Date.UTC(currentYear, 6, 1)),
      periodEnd: octoberBoundary,
      periodLabel: `${currentYear}Q3`,
    });
  }

  return candidates;
}

function buildYearCandidates(now: Date): WrapupCandidate[] {
  const year = now.getUTCFullYear();
  const years = [year - 1, year, year + 1];

  return years.map((currentYear) => {
    const boundary = new Date(Date.UTC(currentYear, 0, 1));
    const targetYear = currentYear - 1;

    return {
      type: "year" as const,
      boundary,
      periodStart: new Date(Date.UTC(targetYear, 0, 1)),
      periodEnd: boundary,
      periodLabel: `${targetYear}`,
    };
  });
}

function computeTopEfficiencyPlayers(
  stats: GroupPeriodWrapupStats
): WrapupEfficiencyPlayer[] {
  const winsByPlayerId = new Map(
    stats.gameWinsByPlayer.map((player) => [player.playerId, player.wins])
  );

  const ranked = stats.gamesPlayedByPlayer
    .filter((player) => player.gamesPlayed > 0)
    .map((player) => {
      const wins = winsByPlayerId.get(player.playerId) ?? 0;
      const winRate = Number(((wins / player.gamesPlayed) * 100).toFixed(1));
      return {
        playerId: player.playerId,
        nickname: player.nickname,
        gamesPlayed: player.gamesPlayed,
        wins,
        winRate,
      };
    })
    .sort((a, b) => {
      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }
      if (b.gamesPlayed !== a.gamesPlayed) {
        return b.gamesPlayed - a.gamesPlayed;
      }
      return a.nickname.localeCompare(b.nickname);
    });

  const totalPlayers = ranked.length;

  return ranked.slice(0, 3).map((player, index) => ({
    ...player,
    percentile:
      totalPlayers <= 1
        ? 100
        : Math.round(((totalPlayers - index - 1) / (totalPlayers - 1)) * 100),
  }));
}
