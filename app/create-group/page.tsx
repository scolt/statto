import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateGroupForm } from "@/features/groups";
import { getSports } from "@/features/sports";

export default async function CreateGroupPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const [sports, t] = await Promise.all([
    getSports(),
    getTranslations(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 glass border-b safe-top">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4 sm:px-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label={t('common.back')}>
              <ArrowLeft className="size-[18px]" />
            </Link>
          </Button>
          <h1 className="ml-2 text-lg font-semibold">{t('groups.createGroup')}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <CreateGroupForm sports={sports} />
      </div>
    </main>
  );
}
