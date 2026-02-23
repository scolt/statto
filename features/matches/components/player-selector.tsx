"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          Group Members
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <Checkbox
                id={`player-${member.id}`}
                checked={selectedIds.has(member.id)}
                onCheckedChange={() => togglePlayer(member.id)}
              />
              <Label
                htmlFor={`player-${member.id}`}
                className="cursor-pointer text-sm font-medium"
              >
                {member.nickname}
              </Label>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No members in this group yet.
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleConfirm}
            disabled={isPending || selectedIds.size < 2}
          >
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Saving…" : `Confirm (${selectedIds.size} selected)`}
          </Button>
          {selectedIds.size < 2 && selectedIds.size > 0 && (
            <p className="text-muted-foreground text-xs">
              Select at least 2 players
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
