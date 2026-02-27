import { auth0 } from "@/lib/auth0";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  GroupList,
  CreateGroupButton,
  getGroupsForUser,
} from "@/features/groups";
import { getPlayerDisplayName } from "@/features/players";
import { Button } from "@/components/ui/button";
import { User, LogOut, Zap } from "lucide-react";

export default async function Home() {
  const session = await auth0.getSession();
  const t = await getTranslations();

  if (!session) {
    return (
      <main className="flex flex-1 flex-col">
        <div className="absolute bg-[url(/landing.png)] w-full h-full -z-1 opacity-3 bg-cover"></div>
        {/* IMAGE_HERE: Abstract geometric pattern with sport elements (ping pong paddles, footballs, dice) in soft violet/indigo gradients on transparent background — hero illustration for landing page, 800x600 */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Zap className="size-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-gradient">Statto</span>
          </h1>
          <p className="mt-3 max-w-sm text-base text-muted-foreground sm:text-lg">
            {t('landing.tagline')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="min-w-[140px]" asChild>
              <a href="/auth/login">{t('auth.signIn')}</a>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[140px]" asChild>
              <a href="/auth/login?screen_hint=signup">{t('auth.signUp')}</a>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const user = session.user;
  const fallbackName = user.name || user.email || "Player";
  
  // Parallel: fetch player name and groups at the same time
  const [playerName, groups] = await Promise.all([
    getPlayerDisplayName(user.sub, fallbackName),
    getGroupsForUser(user.sub),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 glass border-b safe-top">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:px-6">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-gradient">Statto</span>
          </h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile" aria-label="Profile">
                <User className="size-[18px]" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="/auth/logout" aria-label="Log out">
                <LogOut className="size-[18px]" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Welcome */}
        <section className="mb-8">
          <p className="text-sm text-muted-foreground">{t('landing.welcomeBack')}</p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{playerName}</h2>
        </section>
        
        {/* Groups */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('groups.title')}</h3>
            <CreateGroupButton />
          </div>
          <GroupList groups={groups} />
        </section>
      </div>
    </main>
  );
}
