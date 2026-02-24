import { auth0 } from "@/lib/auth0";
import Link from "next/link";
import {
  GroupList,
  CreateGroupButton,
  getGroupsForUser,
} from "@/features/groups";
import { getPlayerDisplayName } from "@/features/players";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Welcome to Statto!</h1>
        <p className="text-muted-foreground">
          Track your stats, compete with friends.
        </p>
        <div className="mt-4 flex gap-4">
          <Button asChild>
            <a href="/auth/login">Log In</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/auth/login?screen_hint=signup">Sign Up</a>
          </Button>
        </div>
      </main>
    );
  }

  // Get the player's display name
  const user = session.user;
  const fallbackName = user.name || user.email || "Player";
  const playerName = await getPlayerDisplayName(user.sub, fallbackName);

  // Get groups the user belongs to
  const groups = await getGroupsForUser(user.sub);

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {playerName}!</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">Profile</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/auth/logout">Logout</a>
          </Button>
        </div>
      </div>

      {/* Groups section */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-semibold">Your Groups</h2>
          <CreateGroupButton />
        </div>
        <GroupList groups={groups} />
      </section>
    </main>
  );
}
