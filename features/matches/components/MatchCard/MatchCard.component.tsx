import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  in_progress: { label: "In Progress", variant: "default" },
  done: { label: "Done", variant: "secondary" },
};

function formatDuration(startedAt: Date, finishedAt: Date): string {
  const seconds = Math.floor(
    (finishedAt.getTime() - startedAt.getTime()) / 1000
  );
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export function MatchCard({ match, index, groupId }: Props) {
  const badge = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.new;
  const duration =
    match.startedAt && match.finishedAt
      ? formatDuration(match.startedAt, match.finishedAt)
      : null;

  return (
    <Link href={`/groups/${groupId}/matches/${match.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Match #{index}</CardTitle>
            <Badge variant={badge.variant} className="text-[10px]">
              {badge.label}
            </Badge>
          </div>
          <CardDescription>
            {match.date.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </CardDescription>
          {duration && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>{duration}</span>
            </div>
          )}
          {match.comment && (
            <CardDescription className="line-clamp-2">
              {match.comment}
            </CardDescription>
          )}
          {match.playerResults.length > 0 && (
            <MatchPlayerResults players={match.playerResults} />
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
