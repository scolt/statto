import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function CreateGroupButton() {
  const t = await getTranslations();

  return (
    <Button size="sm" className="gap-1.5 rounded-full" asChild>
      <Link href="/create-group" aria-label={t('groups.createGroup')}>
        <Plus className="size-4" />
        <span className="hidden sm:inline">{t('groups.newGroup')}</span>
      </Link>
    </Button>
  );
}
