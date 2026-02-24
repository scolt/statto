"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { addPlayersToMatch } from "@/features/matches";
import type { GroupMember } from "@/features/groups";

type Props = {
  groupId: number;
  matchId: number;
  members: GroupMember[];
};

export function PlayerSelector({ groupId, matchId, members }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  function togglePlayer(playerId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  }

  function handleConfirm() {
    if (selectedIds.size < 2) return;

    startTransition(async () => {
      await addPlayersToMatch(matchId, Array.from(selectedIds));
      router.push(`/groups/${groupId}/matches/${matchId}`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        {members.map((member) => {
          const isSelected = selectedIds.has(member.id);
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => togglePlayer(member.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "bg-primary/5 border border-primary/20"
                  : "border border-transparent hover:bg-muted"
              }`}
            >
              <Checkbox
                id={`player-${member.id}`}
                checked={isSelected}
                onCheckedChange={() => togglePlayer(member.id)}
                className="pointer-events-none"
              />
              <Label
                htmlFor={`player-${member.id}`}
                className="pointer-events-none cursor-pointer text-sm font-medium"
              >
                {member.nickname}
              </Label>
              {isSelected && (
                <Check className="ml-auto size-4 text-primary" />
              )}
            </button>
          );
        })}
      </div>

      {members.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No members in this group yet.
        </p>
      )}

      <div className="safe-bottom">
        <Button
          onClick={handleConfirm}
          disabled={isPending || selectedIds.size < 2}
          className="w-full sm:w-auto"
        >
          {isPending && <Loader2 className="animate-spin" />}
          {isPending
            ? "Saving…"
            : `Confirm ${selectedIds.size > 0 ? `(${selectedIds.size})` : ""}`}
        </Button>
        {selectedIds.size > 0 && selectedIds.size < 2 && (
          <p className="mt-2 text-center text-xs text-muted-foreground sm:text-left">
            Select at least 2 players
          </p>
        )}
      </div>
    </div>
  );
}
