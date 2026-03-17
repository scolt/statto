import { auth0 } from "@/lib/auth0";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveGroupWrapup, getGroupById } from "@/features/groups";
import { SportIcon } from "@/features/sports";
import { StartMatchButton } from "@/features/matches/components/StartMatchButton";
import { MatchList } from "@/features/matches/components/MatchList";
import { DeleteGroupButton } from "@/features/groups/components/DeleteGroupButton";
import { StatsLeaderboard } from "@/features/groups/components/StatsLeaderboard";
import { GroupWrapupBanner } from "@/features/groups/components/GroupWrapupBanner";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ groupId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId } = await params;

  let title = "Group";
  let description = "View group stats, leaderboard, and match history on Statto.";

  try {
    const group = await getGroupById(Number(groupId));
    if (group) {
      title = group.name;
      description = group.description
        ? `${group.description} — Track scores and stats on Statto.`
        : `View leaderboard, match history and stats for ${group.name} on Statto.`;
    }
  } catch {
    // fall through to defaults
  }

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Statto`,
      description,
      url: `/groups/${groupId}`,
    },
    twitter: {
      title: `${title} | Statto`,
      description,
    },
  };
}


export default async function GroupPage({ params }: Props) {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  const { groupId } = await params;
  const [group, t, wrapup] = await Promise.all([
    getGroupById(Number(groupId)),
    getTranslations(),
    getActiveGroupWrapup(Number(groupId)),
  ]);
  if (!group) notFound();

  return (
    <main className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b safe-top">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4 sm:px-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label={t('common.back')}>
              <ArrowLeft className="size-4.5" />
            </Link>
          </Button>

          {/* Sport icon badge */}
          {group.sport && (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SportIcon
                slug={group.sport.slug}
                iconName={group.sport.icon}
                className="size-4"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">{group.name}</h1>
            {group.sport && (
              <p className="truncate text-xs text-muted-foreground leading-none mt-0.5">
                {group.sport.name}
              </p>
            )}
          </div>

          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${group.id}/edit`} aria-label={t('common.edit')}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <DeleteGroupButton groupId={group.id} />
        </div>
      </header>

      <GroupWrapupBanner wrapup={wrapup} />

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Description */}
        {group.description && (
          <p className="mb-6 text-sm text-muted-foreground">
            {group.description}
          </p>
        )}

        {/* Stats Leaderboard */}
        <div className="mb-8">
          <StatsLeaderboard groupId={group.id} />
        </div>

        {/* Matches */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('matches.title')}</h2>
            <StartMatchButton groupId={group.id} />
          </div>
          <MatchList groupId={group.id} />
        </section>
      </div>
    </main>
  );
}
