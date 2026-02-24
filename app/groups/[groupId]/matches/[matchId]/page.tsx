import { auth0 } from "@/lib/auth0";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteMatchButton } from "@/features/matches/components/DeleteMatchButton";
import {
  getMatchById,
  getMatchGames,
  getMatchPlayers,
  getAllMarks,
} from "@/features/matches";
import { MatchTimer } from "@/features/matches/components/MatchTimer";
import { PlayerStatsSummary } from "@/features/matches/components/PlayerStatsSummary";
import { GameList } from "@/features/matches/components/GameList";
import { MatchInteractiveSection } from "@/features/matches/components/MatchInteractiveSection";

type Props = {
  params: Promise<{ groupId: string; matchId: string }>;
};

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  new: { label: "New", variant: "outline" },
  in_progress: { label: "In Progress", variant: "default" },
  done: { label: "Completed", variant: "secondary" },
};

export default async function MatchPage({ params }: Props) {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  const { groupId, matchId } = await params;
  const match = await getMatchById(Number(matchId));
  if (!match) notFound();

  const [games, players, marks] = await Promise.all([
    getMatchGames(match.id),
    getMatchPlayers(match.id),
    getAllMarks(),
  ]);

  const badge = STATUS_BADGE[match.status] ?? STATUS_BADGE.new;

  return (
    <main className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b safe-top">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4 sm:px-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${groupId}`} aria-label="Back to Group">
              <ArrowLeft className="size-[18px]" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-semibold">
                Match #{match.id}
              </h1>
              <Badge variant={badge.variant} className="shrink-0 text-[10px]">
                {badge.label}
              </Badge>
            </div>
          </div>
          <DeleteMatchButton matchId={match.id} groupId={Number(groupId)} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Date */}
        <p className="mb-4 text-sm text-muted-foreground">
          {match.date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Timer */}
        <MatchTimer
          startedAt={match.startedAt?.toISOString() ?? null}
          finishedAt={match.finishedAt?.toISOString() ?? null}
          status={match.status}
        />

        {/* Player stats */}
        <PlayerStatsSummary players={players} games={games} />

        {/* Comment + Actions */}
        <MatchInteractiveSection
          matchId={match.id}
          groupId={Number(groupId)}
          players={players}
          marks={marks}
          status={match.status as "new" | "in_progress" | "done"}
          initialComment={match.comment ?? ""}
        />

        {/* Games list */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Games ({games.length})
          </h2>
          <GameList games={games} matchStatus={match.status as "new" | "in_progress" | "done"} />
        </section>
      </div>
    </main>
  );
}
