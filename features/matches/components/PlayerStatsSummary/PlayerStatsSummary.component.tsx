import { Trophy, Minus } from "lucide-react";
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

/* ── 2-player head-to-head duel view ────────────────────────── */
function DuelSummary({ stats }: { stats: PlayerStats[] }) {
  const [a, b] = stats;

  const aLeading = a.wins > b.wins;
  const bLeading = b.wins > a.wins;
  const tied = a.wins === b.wins;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border bg-card">
      {/* Scoreboard */}
      <div className="flex items-stretch">
        {/* Player A side */}
        <div
          className={`flex flex-1 flex-col items-center justify-center px-3 py-5 transition-colors`}
        >
          <p className="mb-1 max-w-full truncate text-xs font-medium text-muted-foreground sm:text-sm">
            {a.nickname}
          </p>
          <div className="flex flex-row gap-2 items-center">
            {aLeading && (
                <Trophy className="size-6 text-yellow-500" />
            )}
            <span
                className={`font-mono text-4xl font-black tabular-nums sm:text-5xl ${
                    aLeading
                        ? "text-green-600 dark:text-green-400"
                        : bLeading
                            ? "text-red-500/80 dark:text-red-400/80"
                            : "text-foreground"
                }`}
            >
            {a.wins}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center justify-center px-2">
          <div className="h-8 w-px bg-border" />
          <span className="my-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            vs
          </span>
          <div className="h-8 w-px bg-border" />
        </div>

        {/* Player B side */}
        <div
          className={`flex flex-1 flex-col items-center justify-center px-3 py-5 transition-colors`}
        >
          <p className="mb-1 max-w-full truncate text-xs font-medium text-muted-foreground sm:text-sm">
            {b.nickname}
          </p>
          <div className="flex flex-row gap-2 items-center">
            {bLeading && (
                <Trophy className="size-6 text-yellow-500" />
            )}
            <span
                className={`font-mono text-4xl font-black tabular-nums sm:text-5xl ${
                    bLeading
                        ? "text-green-600 dark:text-green-400"
                        : aLeading
                            ? "text-red-500/80 dark:text-red-400/80"
                            : "text-foreground"
                }`}
            >
            {b.wins}
            </span>
          </div>
        </div>
      </div>

      {/* Draws indicator */}
      {(a.draws > 0 || tied) && (
        <div className="flex items-center justify-center gap-1.5 border-t px-3 py-2">
          <Minus className="size-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            {a.draws > 0
              ? `${a.draws} draw${a.draws > 1 ? "s" : ""}`
              : "Tied"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Multi-player grid view (3+) ───────────────────────────── */
function MultiPlayerSummary({ stats }: { stats: PlayerStats[] }) {
  const maxWins = Math.max(...stats.map((s) => s.wins));
  const hasDraw = stats.some((s) => s.draws > 0);

  return (
    <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
      {stats.map((stat) => {
        const isLeader = stat.wins === maxWins && maxWins > 0;

        return (
          <div
            key={stat.id}
            className={`rounded-2xl border bg-card px-3 py-3 text-center sm:px-4 ${
              isLeader ? "ring-1 ring-green-500/30 bg-green-500/5" : ""
            }`}
          >
            <p className="mb-1.5 truncate text-xs font-medium text-muted-foreground">
              {stat.nickname}
            </p>
            <div className="flex items-center justify-center gap-1.5 font-mono text-base sm:text-lg">
              <span className="font-semibold text-green-600" title="Wins">
                {stat.wins}
              </span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-red-500" title="Losses">
                {stat.losses}
              </span>
              {stat.draws > 0 && (
                <>
                  <span className="text-muted-foreground/40">/</span>
                  <span className="text-yellow-500" title="Draws">
                    {stat.draws}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              W / L{hasDraw ? " / D" : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main export ────────────────────────────────────────────── */
export function PlayerStatsSummary({ players, games }: Props) {
  if (games.length === 0) return null;

  const stats = computeStats(players, games);
  const isTwoPlayer = stats.length === 2;

  return isTwoPlayer ? (
    <DuelSummary stats={stats} />
  ) : (
    <MultiPlayerSummary stats={stats} />
  );
}
