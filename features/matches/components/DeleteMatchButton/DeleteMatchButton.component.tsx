"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMatch } from "@/features/matches/actions/delete-match";

type Props = {
  matchId: number;
  groupId: number;
};

export function DeleteMatchButton({ matchId, groupId }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(t('matches.deleteMatchConfirm'))) {
      return;
    }

    startTransition(async () => {
      await deleteMatch(matchId);
      router.push(`/groups/${groupId}`);
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="text-destructive hover:text-destructive"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
    </Button>
  );
}
