"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeMatch } from "@/features/matches";

type Props = {
  matchId: number;
};

export function CompleteMatchButton({ matchId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    if (!confirm("Are you sure you want to complete this match?")) return;

    startTransition(async () => {
      await completeMatch(matchId);
      router.refresh();
    });
  }

  return (
    <Button
      variant="outline"
      onClick={handleComplete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CheckCircle className="size-4" />
      )}
      {isPending ? "Completing…" : "Complete Match"}
    </Button>
  );
}
