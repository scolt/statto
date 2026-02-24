"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeMatch } from "@/features/matches";

type Props = {
  matchId: number;
  comment?: string;
};

export function CompleteMatchButton({ matchId, comment }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    if (!confirm("Are you sure you want to complete this match?")) return;

    startTransition(async () => {
      await completeMatch(matchId, comment || null);
      router.refresh();
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleComplete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <CheckCircle className="size-3.5" />
      )}
      {isPending ? "Completing…" : "Complete"}
    </Button>
  );
}
