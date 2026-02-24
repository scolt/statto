import { auth0 } from "@/lib/auth0";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGroupById, getGroupMembers } from "@/features/groups";
import { getMatchById } from "@/features/matches";
import { PlayerSelector } from "@/features/matches/components/PlayerSelector";

type Props = {
  params: Promise<{ groupId: string; matchId: string }>;
};

export default async function SelectPlayersPage({ params }: Props) {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  const { groupId, matchId } = await params;
  
  // Parallel: fetch group and match at the same time
  const [group, match] = await Promise.all([
    getGroupById(Number(groupId)),
    getMatchById(Number(matchId)),
  ]);
  
  if (!group || !match) notFound();
  
  const members = await getGroupMembers(group.id);

  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 glass border-b safe-top">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4 sm:px-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${group.id}`} aria-label="Back to Group">
              <ArrowLeft className="size-[18px]" />
            </Link>
          </Button>
          <div className="ml-2">
            <h1 className="text-lg font-semibold">Select Players</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <p className="mb-6 text-sm text-muted-foreground">
          Choose who is playing in this match
        </p>
        <PlayerSelector
          groupId={group.id}
          matchId={match.id}
          members={members}
        />
      </div>
    </main>
  );
}
