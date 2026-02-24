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
  const group = await getGroupById(Number(groupId));
  const match = await getMatchById(Number(matchId));

  if (!group || !match) notFound();

  const members = await getGroupMembers(group.id);

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link
            href={`/groups/${group.id}`}
            aria-label="Back to Group"
          >
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Select Players</h1>
          <p className="text-muted-foreground text-sm">
            Choose who is playing in this match
          </p>
        </div>
      </div>

      <PlayerSelector
        groupId={group.id}
        matchId={match.id}
        members={members}
      />
    </main>
  );
}
