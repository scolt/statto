import Link from "next/link";
import { Clock, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MatchPlayerResults } from "./MatchPlayerResults";
import type { MatchListItem } from "@/features/matches/queries/get-matches-for-group";

type Props = {
  match: MatchListItem;
  index: number;
  groupId: number;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  new: { label: "New", variant: "outline" },
  in_progress: { label: "Live", variant: "default" },
  paused: { label: "Paused", variant: "outline" },
  done: { label: "Done", variant: "secondary" },
};

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m`;
  return "<1m";
}

export function MatchCard({ match, index, groupId }: Props) {
  const badge = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.new;
  const showDuration = match.duration > 0;

  return (
    <Link href={`/groups/${groupId}/matches/${match.id}`}>
      <div className="card-hover rounded-2xl border bg-card p-4">
        {/* Top row */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold">Match #{index}</span>
          <Badge
            variant={badge.variant}
            className={`text-[10px] ${
              match.status === "paused" ? "text-amber-600 border-amber-300" : ""
            }`}
          >
            {match.status === "paused" && <Pause className="mr-1 size-2.5" />}
            {badge.label}
          </Badge>
        </div>

        {/* Date + Duration */}
        <p className="text-xs text-muted-foreground">
          {match.date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
          {showDuration && (
            <span className="ml-2 inline-flex items-center gap-1">
              <Clock className="inline size-3" />
              {formatDuration(match.duration)}
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
