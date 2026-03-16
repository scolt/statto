import { auth0 } from "@/lib/auth0";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
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
import { MatchPageClient } from "./MatchPageClient";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ groupId: string; matchId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId, matchId } = await params;

  let title = `Match #${matchId}`;
  let description = "View match details, scores, and player stats on Statto.";

  try {
    const match = await getMatchById(Number(matchId));
    if (match) {
      const dateStr = match.date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const statusLabels: Record<string, string> = {
        new: "Upcoming",
        in_progress: "Live",
        paused: "Paused",
        done: "Completed",
      };
      const statusStr = statusLabels[match.status] ?? match.status;
      title = `Match #${matchId} — ${dateStr}`;
      description = `${statusStr} match on ${dateStr}. View scores, player stats, and game results on Statto.`;
    }
  } catch {
    // fall through to defaults
  }

  const ogImageUrl = `/groups/${groupId}/matches/${matchId}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Statto`,
      description,
      url: `/groups/${groupId}/matches/${matchId}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Statto`,
      description,
      images: [ogImageUrl],
    },
  };
}


const BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  new: "outline",
  in_progress: "default",
  paused: "outline",
  done: "secondary",
};

export default async function MatchPage({ params }: Props) {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  const { groupId, matchId } = await params;
  const [match, t, locale] = await Promise.all([
    getMatchById(Number(matchId)),
    getTranslations(),
    getLocale(),
  ]);
  if (!match) notFound();

  // Parallel: fetch games, players, and marks at the same time
  const [games, players, marks] = await Promise.all([
    getMatchGames(match.id),
    getMatchPlayers(match.id),
    getAllMarks(),
  ]);

  // Resolve the current user's player profile to check participation
  const { findFullProfileByExternalId } = await import(
    "@/features/players/repository/players.repository"
  );
  const profile = await findFullProfileByExternalId(session.user.sub);
  const currentPlayerId = profile?.playerId ?? null;
  const isParticipant = currentPlayerId !== null &&
    players.some((p) => p.id === currentPlayerId);

  const statusKey = match.status as "new" | "in_progress" | "paused" | "done";
  const badgeVariant = BADGE_VARIANTS[statusKey] ?? "outline";

  return (
    <main className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b safe-top">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4 sm:px-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${groupId}`} aria-label={t('common.back')}>
              <ArrowLeft className="size-[18px]" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-semibold">
                {t('matches.match')} #{match.id}
              </h1>
              <Badge variant={badgeVariant} className="shrink-0 text-[10px]">
                {t(`matches.status.${statusKey}`)}
              </Badge>
            </div>
          </div>
          {isParticipant && (
            <DeleteMatchButton matchId={match.id} groupId={Number(groupId)} />
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Date */}
        <p className="mb-4 text-sm text-muted-foreground">
          {match.date.toLocaleDateString(locale, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Client section: timer + optimistic stats + interactive actions + game list */}
        <MatchPageClient
          matchId={match.id}
          groupId={Number(groupId)}
          players={players}
          marks={marks}
          status={match.status as "new" | "in_progress" | "paused" | "done"}
          duration={match.duration}
          timerStartedAt={match.timerStartedAt?.toISOString() ?? null}
          initialComment={match.comment ?? ""}
          initialGames={games}
          isParticipant={isParticipant}
        />
      </div>
    </main>
  );
}
