"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMatch } from "@/features/matches";

type Props = {
  groupId: number;
};

export function StartMatchButton({ groupId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const matchId = await createMatch(groupId);
      router.push(`/groups/${groupId}/matches/${matchId}/select-players`);
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending} size="sm">
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Plus className="size-4" />
      )}
      {isPending ? "Creating…" : "Start New Match"}
    </Button>
  );
}
