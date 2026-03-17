"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateGame } from "@/features/matches";
import type { Mark, GameWithDetails } from "@/features/matches";
import { ScoreInputList } from "@/features/matches/components/MatchActions/ReportGameButton/ReportGameForm/ScoreInputList";
import { MarkCheckboxList } from "@/features/matches/components/MatchActions/ReportGameButton/ReportGameForm/MarkCheckboxList";

type Props = {
  game: GameWithDetails;
  marks: Mark[];
  onSuccess: () => void;
};

type FormValues = {
  scores: Record<string, number>;
  markIds: number[];
  comment: string;
};

export function EditGameForm({ game, marks, onSuccess }: Props) {
  const t = useTranslations();

  const players = game.scores.map((s) => ({ id: s.playerId, nickname: s.playerName }));

  const defaultScores: Record<string, number> = {};
  for (const s of game.scores) {
    defaultScores[String(s.playerId)] = s.score;
  }

  const form = useForm<FormValues>({
    defaultValues: {
      scores: defaultScores,
      markIds: game.marks.map((m) => m.id),
      comment: game.comment ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    const scores = players.map((p) => ({
      playerId: p.id,
      score: Number(values.scores[String(p.id)]) || 0,
    }));

    await updateGame({
      gameId: game.id,
      scores,
      markIds: values.markIds,
      comment: values.comment || undefined,
    });

    onSuccess();
  }

  const isPending = form.formState.isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <ScoreInputList players={players} form={form} />

      {marks.length > 0 && <MarkCheckboxList marks={marks} form={form} />}

      <div className="space-y-2">
        <Label htmlFor="edit-game-comment">{t("games.comment")}</Label>
        <Input
          id="edit-game-comment"
          placeholder={t("games.commentPlaceholder")}
          onFocus={(e) => e.target.select()}
          {...form.register("comment")}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
          {isPending && <Loader2 className="animate-spin" />}
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess} disabled={isPending}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
