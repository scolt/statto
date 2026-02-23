import { auth0 } from "@/lib/auth0";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGroupById } from "@/features/groups";
import { StartMatchButton } from "@/features/matches/components/start-match-button";
import { MatchList } from "@/features/matches/components/match-list";

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
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" aria-label="Back to Home">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-muted-foreground text-sm">{group.description}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/groups/${group.id}/edit`} aria-label="Edit group">
            <Pencil className="size-4" />
          </Link>
        </Button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Matches</h2>
          <StartMatchButton groupId={group.id} />
        </div>
        <MatchList groupId={group.id} />
      </section>
    </main>
  );
}
