import type { GameWithDetails, MatchPlayer } from "@/features/matches";

type Props = {
  players: MatchPlayer[];
  games: GameWithDetails[];
};

type PlayerStats = {
  id: number;
  nickname: string;
  wins: number;
  losses: number;
  draws: number;
};

function computeStats(
  players: MatchPlayer[],
  games: GameWithDetails[]
): PlayerStats[] {
  const statsMap = new Map<number, PlayerStats>();

  for (const p of players) {
    statsMap.set(p.id, {
      id: p.id,
      nickname: p.nickname,
      wins: 0,
      losses: 0,
      draws: 0,
    });
  }

  for (const game of games) {
    if (game.scores.length < 2) continue;

    const maxScore = Math.max(...game.scores.map((s) => s.score));
    const winnersCount = game.scores.filter(
      (s) => s.score === maxScore
    ).length;
    const isDraw = winnersCount === game.scores.length;

    for (const s of game.scores) {
      const stat = statsMap.get(s.playerId);
      if (!stat) continue;

      if (isDraw) {
        stat.draws++;
      } else if (s.score === maxScore) {
        stat.wins++;
      } else {
        stat.losses++;
      }
    }
  }

  return Array.from(statsMap.values());
}

export function PlayerStatsSummary({ players, games }: Props) {
  if (games.length === 0) return null;

  const stats = computeStats(players, games);

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="rounded-lg border px-4 py-3 text-center"
        >
          <p className="text-muted-foreground mb-1 truncate text-xs font-medium">
            {stat.nickname}
          </p>
          <div className="flex items-center justify-center gap-2 font-mono text-lg">
            <span className="text-green-600" title="Wins">
              {stat.wins}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-red-500" title="Losses">
              {stat.losses}
            </span>
            {stat.draws > 0 && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-yellow-500" title="Draws">
                  {stat.draws}
                </span>
              </>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-[10px] uppercase tracking-wider">
            W / L{stats.some((s) => s.draws > 0) ? " / D" : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
