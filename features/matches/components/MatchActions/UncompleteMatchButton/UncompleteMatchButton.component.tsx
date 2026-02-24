"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uncompleteMatch } from "@/features/matches";

type Props = {
  matchId: number;
};

export function UncompleteMatchButton({ matchId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleUncomplete() {
    if (!confirm("Revert this match to In Progress?")) return;

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
      {isPending ? "Reverting…" : "Reopen Match"}
    </Button>
  );
}
