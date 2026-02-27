"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Undo2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uncompleteMatch } from "@/features/matches";

type Props = {
  matchId: number;
};

export function UncompleteMatchButton({ matchId }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  function handleUncomplete() {
    if (!confirm(t('timer.reopenConfirm'))) return;

    startTransition(async () => {
      await uncompleteMatch(matchId);
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleUncomplete} disabled={isPending}>
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Undo2 className="size-3.5" />
      )}
      {isPending ? t('timer.reopening') : t('timer.reopen')}
    </Button>
  );
}
