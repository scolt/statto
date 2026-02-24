"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UseFormReturn } from "react-hook-form";
import type { MatchPlayer } from "@/features/matches";

type FormValues = {
  scores: Record<string, number>;
  markIds: number[];
  comment: string;
};

type Props = {
  players: MatchPlayer[];
  form: UseFormReturn<FormValues>;
};

export function ScoreInputList({ players, form }: Props) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Scores</Label>
      {players.map((player) => (
        <div key={player.id} className="flex items-center gap-3">
          <span className="text-muted-foreground w-28 shrink-0 truncate text-sm">
            {player.nickname}
          </span>
          <Input
            type="number"
            min={0}
            className="w-24"
            {...form.register(`scores.${player.id}`, { valueAsNumber: true })}
          />
        </div>
      ))}
    </div>
  );
}
