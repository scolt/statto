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
    <Button onClick={handleClick} disabled={isPending} size="sm" className="gap-1.5 rounded-full">
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Plus className="size-3.5" />
      )}
      <span className="hidden sm:inline">
        {isPending ? "Creating…" : "New Match"}
      </span>
    </Button>
  );
}
