import { getGroupPlayerStats } from "@/features/groups/queries/get-group-player-stats";
import { StatsPlayerRow } from "./StatsPlayerRow";
import { StatsHeader } from "./StatsHeader";

type Props = {
  groupId: number;
};

export async function StatsLeaderboard({ groupId }: Props) {
  const stats = await getGroupPlayerStats(groupId);

  if (stats.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Leaderboard</h2>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <StatsHeader />
        <div className="divide-y">
          {stats.map((player, idx) => (
            <StatsPlayerRow
              key={player.playerId}
              player={player}
              rank={idx + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
