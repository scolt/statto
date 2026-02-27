import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Clock, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MatchPlayerResults } from "./MatchPlayerResults";
import type { MatchListItem } from "@/features/matches/queries/get-matches-for-group";

type Props = {
  match: MatchListItem;
  index: number;
  groupId: number;
};

const BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  new: "outline",
  in_progress: "default",
  paused: "outline",
  done: "secondary",
};

function formatDuration(seconds: number): { key: string; params?: { hours: number; minutes: number } | { minutes: number } } {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return { key: 'duration.hours', params: { hours: hrs, minutes: mins } };
  if (mins > 0) return { key: 'duration.minutes', params: { minutes: mins } };
  return { key: 'duration.lessThanMinute' };
}

export async function MatchCard({ match, index, groupId }: Props) {
  const [t, locale] = await Promise.all([
    getTranslations(),
    getLocale(),
  ]);
  const statusKey = match.status as "new" | "in_progress" | "paused" | "done";
  const badgeVariant = BADGE_VARIANTS[statusKey] ?? "outline";
  const showDuration = match.duration > 0;

  return (
    <Link href={`/groups/${groupId}/matches/${match.id}`}>
      <div className="card-hover rounded-2xl border bg-card p-4">
        {/* Top row */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold">{t('matches.match')} #{match.id}</span>
          <Badge
            variant={badgeVariant}
            className={`text-[10px] ${
              match.status === "paused" ? "text-amber-600 border-amber-300" : ""
            }`}
          >
            {match.status === "paused" && <Pause className="mr-1 size-2.5" />}
            {t(`matches.status.${statusKey}`)}
          </Badge>
        </div>
      
        {/* Date + Duration */}
        <p className="text-xs text-muted-foreground">
          {match.date.toLocaleDateString(locale, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
          {showDuration && (
            <span className="ml-2 inline-flex items-center gap-1">
              <Clock className="inline size-3" />
              {(() => {
                const dur = formatDuration(match.duration);
                return dur.params ? t(dur.key as keyof IntlMessages, dur.params) : t(dur.key as keyof IntlMessages);
              })()}
            </span>
          )}
        </p>

        {/* Comment */}
        {match.comment && (
          <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground italic">
            {match.comment}
          </p>
        )}

        {/* Player results */}
        {match.playerResults.length > 0 && (
          <MatchPlayerResults players={match.playerResults} />
        )}
      </div>
    </Link>
  );
}
