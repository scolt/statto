import { getGroupPlayerStats } from "@/features/groups/queries/get-group-player-stats";
import { StatsPlayerRow } from "./stats-player-row";
import { StatsHeader } from "./stats-header";

type Props = {
  groupId: number;
};

export async function StatsLeaderboard({ groupId }: Props) {
  const stats = await getGroupPlayerStats(groupId);

  if (stats.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Player Stats</h2>
      <div className="rounded-lg border">
        <StatsHeader />
        <div className="divide-y">
          {stats.map((player, idx) => (
            <StatsPlayerRow key={player.playerId} player={player} rank={idx + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
