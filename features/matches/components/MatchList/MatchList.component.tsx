import { getTranslations } from "next-intl/server";
import { getMatchesForGroup } from "@/features/matches/queries/get-matches-for-group";
import { MatchCard } from "../MatchCard";

type Props = {
  groupId: number;
};

export async function MatchList({ groupId }: Props) {
  const [matches, t] = await Promise.all([
    getMatchesForGroup(groupId),
    getTranslations(),
  ]);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {t('matches.noMatches')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {t('matches.noMatchesHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
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
