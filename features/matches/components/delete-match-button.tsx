"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMatch } from "@/features/matches/actions/delete-match";

type Props = {
  matchId: number;
  groupId: number;
};

export function DeleteMatchButton({ matchId, groupId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this match? All games and scores will be permanently deleted.")) {
      return;
    }

    startTransition(async () => {
      await deleteMatch(matchId);
      router.push(`/groups/${groupId}`);
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin text-destructive" />
      ) : (
        <Trash2 className="size-4 text-destructive" />
      )}
    </Button>
  );
}
