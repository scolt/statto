"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reportGame } from "@/features/matches";
import type { MatchPlayer, Mark } from "@/features/matches";
import { ScoreInputList } from "./ScoreInputList";
import { MarkCheckboxList } from "./MarkCheckboxList";

type Props = {
  matchId: number;
  groupId: number;
  players: MatchPlayer[];
  marks: Mark[];
  onSuccess: () => void;
};

type FormValues = {
  scores: Record<string, number>;
  markIds: number[];
  comment: string;
};

export function ReportGameForm({
  matchId,
  groupId,
  players,
  marks,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultScores: Record<string, number> = {};
  players.forEach((p) => {
    defaultScores[String(p.id)] = 0;
  });

  const form = useForm<FormValues>({
    defaultValues: {
      scores: defaultScores,
      markIds: [],
      comment: "",
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const scores = players.map((p) => ({
        playerId: p.id,
        score: Number(values.scores[String(p.id)]) || 0,
      }));

      await reportGame({
        matchId,
        scores,
        markIds: values.markIds,
        comment: values.comment || undefined,
      });

      onSuccess();
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Player scores */}
      <ScoreInputList players={players} form={form} />

      {/* Marks */}
      {marks.length > 0 && (
        <MarkCheckboxList marks={marks} form={form} />
      )}

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="game-comment">Comment (optional)</Label>
        <Input
          id="game-comment"
          placeholder="Any notes about this game…"
          {...form.register("comment")}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {isPending ? "Saving…" : "Save Game"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
