import { auth0 } from "@/lib/auth0";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteMatchButton } from "@/features/matches/components/delete-match-button";
import {
  getMatchById,
  getMatchGames,
  getMatchPlayers,
  getAllMarks,
} from "@/features/matches";
import { MatchTimer } from "@/features/matches/components/match-timer";
import { PlayerStatsSummary } from "@/features/matches/components/player-stats-summary";
import { GameList } from "@/features/matches/components/game-list";
import { MatchActions } from "@/features/matches/components/match-actions";

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
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/groups/${groupId}`} aria-label="Back to Group">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Match #{match.id}</h1>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {match.date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <DeleteMatchButton matchId={match.id} groupId={Number(groupId)} />
      </div>

      {/* Timer */}
      <MatchTimer
        startedAt={match.startedAt?.toISOString() ?? null}
        finishedAt={match.finishedAt?.toISOString() ?? null}
        status={match.status}
      />

      {/* Day stats */}
      <PlayerStatsSummary players={players} games={games} />

      {/* Actions — always shown, content depends on status */}
      <MatchActions
        matchId={match.id}
        groupId={Number(groupId)}
        players={players}
        marks={marks}
        status={match.status}
      />

      {/* Game list */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Games ({games.length})
        </h2>
        <GameList games={games} />
      </section>
    </main>
  );
}
