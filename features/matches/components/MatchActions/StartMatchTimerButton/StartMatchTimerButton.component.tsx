"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startMatch } from "@/features/matches";

type Props = {
  matchId: number;
};

export function StartMatchTimerButton({ matchId }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  function handleStart() {
    startTransition(async () => {
      await startMatch(matchId);
      router.refresh();
    });
  }

  return (
    <Button size="sm" onClick={handleStart} disabled={isPending}>
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Play className="size-3.5" />
      )}
      {isPending ? t('timer.starting') : t('timer.start')}
    </Button>
  );
}
