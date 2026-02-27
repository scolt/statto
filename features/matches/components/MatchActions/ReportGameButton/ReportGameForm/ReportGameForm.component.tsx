"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reportGame } from "@/features/matches";
import type { MatchPlayer, Mark, GameWithDetails } from "@/features/matches";
import { ScoreInputList } from "./ScoreInputList";
import { MarkCheckboxList } from "./MarkCheckboxList";

type Props = {
  matchId: number;
  groupId: number;
  players: MatchPlayer[];
  marks: Mark[];
  onSuccess: () => void;
  /** Parent handles optimistic update + transition + error recovery */
  onGameReported?: (optimisticGame: GameWithDetails, submitFn: () => Promise<void>) => void;
  /** Error message passed back from parent after a failed submission */
  error?: string | null;
  /** Pre-filled values to restore after a failed submission */
  prefillGame?: GameWithDetails | null;
};

type FormValues = {
  scores: Record<string, number>;
  markIds: number[];
  comment: string;
};

export function ReportGameForm({
  matchId,
  groupId: _groupId,
  players,
  marks,
  onSuccess,
  onGameReported,
  error,
  prefillGame,
}: Props) {
  const t = useTranslations();
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

  // Restore prefilled values when the modal re-opens after an error
  useEffect(() => {
    if (!prefillGame) return;
    const restoredScores: Record<string, number> = {};
    for (const s of prefillGame.scores) {
      restoredScores[String(s.playerId)] = s.score;
    }
    form.reset({
      scores: restoredScores,
      markIds: prefillGame.marks.map((m) => m.id),
      comment: prefillGame.comment ?? "",
    });
  }, [prefillGame]); // eslint-disable-line react-hooks/exhaustive-deps

  function onSubmit(values: FormValues) {
    const scores = players.map((p) => ({
      playerId: p.id,
      score: Number(values.scores[String(p.id)]) || 0,
    }));

    const optimisticGame: GameWithDetails = {
      id: -Date.now(),
      comment: values.comment || null,
      scores: scores.map((s) => ({
        playerId: s.playerId,
        playerName: players.find((p) => p.id === s.playerId)?.nickname ?? "",
        score: s.score,
      })),
      marks: marks.filter((m) => values.markIds.includes(m.id)),
    };

    // The actual server call — parent wraps it in startTransition + error handling
    const submitFn = async () => {
      await reportGame({
        matchId,
        scores,
        markIds: values.markIds,
        comment: values.comment || undefined,
      });
    };

    if (onGameReported) {
      onGameReported(optimisticGame, submitFn);
      onSuccess(); // close the modal immediately (optimistic)
    } else {
      // Fallback: just call the server directly (no optimistic path)
      submitFn().then(onSuccess);
    }
  }

  const isPending = form.formState.isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Error banner — shown when parent reports a failure */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <ScoreInputList players={players} form={form} />

      {marks.length > 0 && <MarkCheckboxList marks={marks} form={form} />}

      <div className="space-y-2">
        <Label htmlFor="game-comment">{t('games.comment')}</Label>
        <Input
          id="game-comment"
          placeholder={t('games.commentPlaceholder')}
          onFocus={(e) => e.target.select()}
          {...form.register("comment")}
        />
      </div>
      
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
          {isPending && <Loader2 className="animate-spin" />}
          {isPending ? t('common.saving') : t('games.saveGame')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isPending}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
