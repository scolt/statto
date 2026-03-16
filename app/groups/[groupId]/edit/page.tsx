import type { Metadata } from "next";
import { auth0 } from "@/lib/auth0";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGroupById, getGroupMembersWithUsername, EditGroupForm } from "@/features/groups";
import { getSports } from "@/features/sports";
import { getGroupNotifications, NotificationSettings } from "@/features/notifications";

type Props = {
  params: Promise<{ groupId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId } = await params;

  let title = "Edit Group";
  try {
    const { getGroupById } = await import("@/features/groups");
    const group = await getGroupById(Number(groupId));
    if (group) title = `Edit ${group.name}`;
  } catch {
    // fall through
  }

  return {
    title,
    description: "Edit group settings, members, and notification preferences on Statto.",
    robots: { index: false, follow: false },
  };
}

export default async function EditGroupPage({ params }: Props) {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  const { groupId } = await params;

  const [group, sports, notifications, t] = await Promise.all([
    getGroupById(Number(groupId)),
    getSports(),
    getGroupNotifications(Number(groupId)),
    getTranslations(),
  ]);
  if (!group) notFound();

  const members = await getGroupMembersWithUsername(group.id);

  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 glass border-b safe-top">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4 sm:px-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${group.id}`} aria-label={t('common.back')}>
              <ArrowLeft className="size-[18px]" />
            </Link>
          </Button>
          <h1 className="ml-2 text-lg font-semibold">{t('groups.editGroup')}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <EditGroupForm
          groupId={group.id}
          initialName={group.name}
          initialDescription={group.description ?? ""}
          initialPlayers={members}
          initialSportId={group.sport?.id ?? null}
          sports={sports}
        />
      
        <div className="mt-8">
          <NotificationSettings groupId={group.id} notifications={notifications} />
        </div>
      </div>
    </main>
  );
}
