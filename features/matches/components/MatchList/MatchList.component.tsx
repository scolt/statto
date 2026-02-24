import { getMatchesForGroup } from "@/features/matches/queries/get-matches-for-group";
import { MatchCard } from "../MatchCard";

type Props = {
  groupId: number;
};

export async function MatchList({ groupId }: Props) {
  const matches = await getMatchesForGroup(groupId);

  if (matches.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No matches yet. Start a new match to get going!
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match, idx) => (
        <MatchCard
          key={match.id}
          match={match}
          index={matches.length - idx}
          groupId={groupId}
        />
      ))}
    </div>
  );
}
