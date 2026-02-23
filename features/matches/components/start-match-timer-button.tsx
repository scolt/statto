"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startMatch } from "@/features/matches";

type Props = {
  matchId: number;
};

export function StartMatchTimerButton({ matchId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStart() {
    startTransition(async () => {
      await startMatch(matchId);
      router.refresh();
    });
  }

  return (
    <Button onClick={handleStart} disabled={isPending}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Play className="size-4" />
      )}
      {isPending ? "Starting…" : "Start Match"}
    </Button>
  );
}
