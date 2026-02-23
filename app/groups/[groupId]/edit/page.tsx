import { auth0 } from "@/lib/auth0";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGroupById, getGroupMembersWithUsername, EditGroupForm } from "@/features/groups";

type Props = {
  params: Promise<{ groupId: string }>;
};

export default async function EditGroupPage({ params }: Props) {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  const { groupId } = await params;
  const group = await getGroupById(Number(groupId));
  if (!group) notFound();

  const members = await getGroupMembersWithUsername(group.id);

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/groups/${group.id}`} aria-label="Back to group">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Group</h1>
      </div>

      <EditGroupForm
        groupId={group.id}
        initialName={group.name}
        initialDescription={group.description ?? ""}
        initialPlayers={members}
      />
    </main>
  );
}
