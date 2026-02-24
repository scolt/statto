import { auth0 } from "@/lib/auth0";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGroupById } from "@/features/groups";
import { StartMatchButton } from "@/features/matches/components/StartMatchButton";
import { MatchList } from "@/features/matches/components/MatchList";
import { DeleteGroupButton } from "@/features/groups/components/DeleteGroupButton";
import { StatsLeaderboard } from "@/features/groups/components/StatsLeaderboard";

type Props = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupPage({ params }: Props) {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  const { groupId } = await params;
  const group = await getGroupById(Number(groupId));
  if (!group) notFound();

  return (
    <main className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b safe-top">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4 sm:px-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Back to Home">
              <ArrowLeft className="size-[18px]" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">{group.name}</h1>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${group.id}/edit`} aria-label="Edit group">
              <Pencil className="size-4" />
            </Link>
          </Button>
          <DeleteGroupButton groupId={group.id} />
        </div>
      </header>

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
            <h2 className="text-lg font-semibold">Matches</h2>
            <StartMatchButton groupId={group.id} />
          </div>
          <MatchList groupId={group.id} />
        </section>
      </div>
    </main>
  );
}
