"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReportGameForm } from "./ReportGameForm";
import type { MatchPlayer, Mark } from "@/features/matches";

type Props = {
  matchId: number;
  groupId: number;
  players: MatchPlayer[];
  marks: Mark[];
};

export function ReportGameButton({ matchId, groupId, players, marks }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5" />
          Report Game
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Game Result</DialogTitle>
        </DialogHeader>
        <ReportGameForm
          matchId={matchId}
          groupId={groupId}
          players={players}
          marks={marks}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
