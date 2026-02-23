import { db } from "@/lib/db";
import { matchesTable } from "@/lib/db/schemas/matches";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Props = {
  groupId: number;
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  new: { label: "New", variant: "outline" },
  in_progress: { label: "In Progress", variant: "default" },
  done: { label: "Done", variant: "secondary" },
};

export async function MatchList({ groupId }: Props) {
  const matches = await db
    .select({
      id: matchesTable.id,
      date: matchesTable.date,
      status: matchesTable.status,
      comment: matchesTable.comment,
    })
    .from(matchesTable)
    .where(eq(matchesTable.groupId, groupId))
    .orderBy(desc(matchesTable.date));

  if (matches.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No matches yet. Start a new match to get going!
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => {
        const badge = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.new;
        return (
          <Link key={match.id} href={`/groups/${groupId}/matches/${match.id}`}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Match #{match.id}
                  </CardTitle>
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
                {match.comment && (
                  <CardDescription className="line-clamp-2">
                    {match.comment}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
