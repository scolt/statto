import type { PlayerStats } from "@/features/groups/queries/get-group-player-stats";
import { StatsCell } from "./stats-cell";

type Props = {
  player: PlayerStats;
  rank: number;
};

function getRankDisplay(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank);
}

export function StatsPlayerRow({ player, rank }: Props) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem] items-center gap-2 px-4 py-2.5">
      <span className="text-sm font-medium">{getRankDisplay(rank)}</span>
      <span className="truncate text-sm font-medium">{player.nickname}</span>
      <StatsCell value={player.matchWins} highlight="primary" />
      <StatsCell value={player.gameWins} highlight="success" />
      <StatsCell value={player.totalGames} />
      <StatsCell value={player.totalPoints} />
    </div>
  );
}
