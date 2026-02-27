import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { ArrowLeft, LogOut, Calendar, Shield } from "lucide-react";
import { getCurrentUser } from "@/lib/auth0";
import { getProfile, EditProfileForm } from "@/features/players";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { type Locale } from "@/i18n/config";

export default async function ProfilePage() {
  const auth0User = await getCurrentUser();

  if (!auth0User) {
    redirect("/auth/login");
  }

  const [profile, t, locale] = await Promise.all([
    getProfile(auth0User.sub),
    getTranslations(),
    getLocale(),
  ]);

  if (!profile) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <p className="text-destructive">
          {t('common.error')}
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b safe-top">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4 sm:px-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label={t('common.back')}>
              <ArrowLeft className="size-[18px]" />
            </Link>
          </Button>
          <h1 className="ml-2 text-lg font-semibold">{t('profile.title')}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Avatar + Name header */}
        <section className="mb-8 flex items-center gap-4">
          {/* IMAGE_HERE: Default user avatar placeholder — circular, soft violet gradient background with white user silhouette, 128x128 */}
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary sm:size-20 sm:text-3xl">
            {(profile.nickname || profile.name)?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold sm:text-2xl">
              {profile.name}
            </h2>
            {profile.nickname && (
              <p className="truncate text-sm text-muted-foreground">
                @{profile.nickname}
              </p>
            )}
          </div>
        </section>

        {/* Edit Profile */}
        <section className="mb-6 rounded-2xl border bg-card p-5 sm:p-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('profile.editProfile')}
          </h3>
          <EditProfileForm
            playerId={profile.playerId}
            initialName={profile.name}
            initialNickname={profile.nickname}
          />
        </section>

        {/* Language */}
        <section className="mb-6 rounded-2xl border bg-card p-5 sm:p-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('profile.language')}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {t('profile.languageHint')}
          </p>
          <LocaleSwitcher currentLocale={locale as Locale} />
        </section>

        {/* Account Info */}
        <section className="mb-6 rounded-2xl border bg-card p-5 sm:p-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('profile.accountInfo')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Shield className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{t('profile.provider')}</p>
                <p className="truncate text-sm font-medium">
                  {profile.provider ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Calendar className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{t('profile.memberSince')}</p>
                <p className="text-sm font-medium">
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString(locale, {
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Favourite Sports */}
        {profile.favouriteSports.length > 0 && (
          <section className="mb-6 rounded-2xl border bg-card p-5 sm:p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('profile.favouriteSports')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.favouriteSports.map((sport: string) => (
                <Badge key={sport} variant="secondary">
                  {sport}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Logout */}
        <Separator className="my-6" />
        <div className="pb-8 text-center safe-bottom">
          <Button variant="ghost" className="text-destructive" asChild>
            <a href="/auth/logout">
              <LogOut className="size-4" />
              {t('auth.signOut')}
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
