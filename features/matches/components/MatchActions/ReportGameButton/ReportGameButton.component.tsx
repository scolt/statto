"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
import type { MatchPlayer, Mark, GameWithDetails } from "@/features/matches";

type Props = {
  matchId: number;
  groupId: number;
  players: MatchPlayer[];
  marks: Mark[];
  onGameReported?: (optimisticGame: GameWithDetails, submitFn: () => Promise<void>) => void;
  /** Controlled open state — set to true by parent to re-open after an error */
  forceOpen?: boolean;
  /** Error message shown inside the dialog */
  error?: string | null;
  /** Pre-filled game values to restore into the form after a failed submission */
  prefillGame?: GameWithDetails | null;
  onErrorDismissed?: () => void;
};

export function ReportGameButton({
  matchId,
  groupId,
  players,
  marks,
  onGameReported,
  forceOpen,
  error,
  prefillGame,
  onErrorDismissed,
}: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  // Re-open when parent signals an error occurred
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) onErrorDismissed?.();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5" />
          {t('games.reportGame')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('games.reportGame')}</DialogTitle>
        </DialogHeader>
        <ReportGameForm
          matchId={matchId}
          groupId={groupId}
          players={players}
          marks={marks}
          onSuccess={() => handleOpenChange(false)}
          onGameReported={onGameReported}
          error={error}
          prefillGame={prefillGame}
        />
      </DialogContent>
    </Dialog>
  );
}
