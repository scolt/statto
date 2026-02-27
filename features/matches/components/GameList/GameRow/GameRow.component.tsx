"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteGame } from "@/features/matches";
import type { GameWithDetails } from "@/features/matches";

type Props = {
  game: GameWithDetails;
  index: number;
};

function DuelGameRow({ game, index }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [a, b] = game.scores;

  const aWins = a.score > b.score;
  const bWins = b.score > a.score;
  const isDraw = a.score === b.score;

  function handleDelete() {
    if (!confirm("Remove this game?")) return;
    startTransition(async () => {
      await deleteGame(game.id);
      router.refresh();
    });
  }

  return (
    <div className="group rounded-xl border bg-card transition-colors">
      <div className="flex items-center px-3 py-2.5 sm:px-4">
        {/* Game number */}
        <span className="mr-3 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
          {index}
        </span>

        {/* Player A */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span
            className={`truncate text-sm ${
              aWins ? "font-semibold" : "text-muted-foreground"
            }`}
          >
            {a.playerName}
          </span>
        </div>

        {/* Score pill */}
        <div className="mx-2 flex items-center gap-0.5 sm:mx-3">
          <span
            className={`min-w-[28px] rounded-l-lg px-2 py-1 text-center font-mono text-sm font-bold tabular-nums sm:text-base ${
              aWins
                ? "bg-green-500/15 text-green-600 dark:text-green-400"
                : isDraw
                  ? "bg-muted text-foreground"
                  : "bg-red-500/10 text-red-500/80 dark:text-red-400/80"
            }`}
          >
            {a.score}
          </span>
          <span className="px-0.5 text-[10px] font-bold text-muted-foreground/50">
            :
          </span>
          <span
            className={`min-w-[28px] rounded-r-lg px-2 py-1 text-center font-mono text-sm font-bold tabular-nums sm:text-base ${
              bWins
                ? "bg-green-500/15 text-green-600 dark:text-green-400"
                : isDraw
                  ? "bg-muted text-foreground"
                  : "bg-red-500/10 text-red-500/80 dark:text-red-400/80"
            }`}
          >
            {b.score}
          </span>
        </div>

        {/* Player B */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
          <span
            className={`truncate text-right text-sm ${
              bWins ? "font-semibold" : "text-muted-foreground"
            }`}
          >
            {b.playerName}
          </span>
        </div>

        {/* Delete button — visible on hover / always on touch */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-1.5 size-7 shrink-0 opacity-50 transition-opacity hover:opacity-100 group-hover:opacity-100 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Remove game"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </Button>
      </div>

      {/* Marks + Comment */}
      {(game.marks.length > 0 || game.comment) && (
        <div className="border-t px-3 py-2 sm:px-4">
          {game.marks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {game.marks.map((mark) => (
                <Badge
                  key={mark.id}
                  variant="secondary"
                  className="px-1.5 py-0 text-[10px]"
                >
                  {mark.name}
                </Badge>
              ))}
            </div>
          )}
          {game.comment && (
            <p
              className={`text-xs italic text-muted-foreground ${
                game.marks.length > 0 ? "mt-1" : ""
              }`}
            >
              {game.comment}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MultiPlayerGameRow({ game, index }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const maxScore = Math.max(...game.scores.map((s) => s.score));
  const winnersCount = game.scores.filter((s) => s.score === maxScore).length;
  const isDraw = winnersCount === game.scores.length;

  function handleDelete() {
    if (!confirm("Remove this game?")) return;
    startTransition(async () => {
      await deleteGame(game.id);
      router.refresh();
    });
  }

  return (
    <div className="group rounded-xl border bg-card px-3 py-2.5 sm:px-4">
      {/* Score line */}
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
          {index}
        </span>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
          {game.scores.map((s, i) => {
            const isWinner = !isDraw && s.score === maxScore;

            return (
              <span
                key={s.playerId}
                className="inline-flex items-center gap-1"
              >
                {i > 0 && (
                  <span className="mr-0.5 text-[10px] text-muted-foreground">
                    vs
                  </span>
                )}
                <span
                  className={`truncate text-xs ${
                    isWinner ? "font-medium" : "text-muted-foreground"
                  }`}
                >
                  {s.playerName}
                </span>
                <span
                  className={`font-mono text-sm font-bold tabular-nums ${
                    isWinner
                      ? "text-green-600 dark:text-green-400"
                      : isDraw
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {s.score}
                </span>
              </span>
            );
          })}
        </div>

        {game.marks.length > 0 && (
          <div className="flex shrink-0 flex-wrap gap-1">
            {game.marks.map((mark) => (
              <Badge
                key={mark.id}
                variant="secondary"
                className="px-1.5 py-0 text-[10px]"
              >
                {mark.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Delete button */}
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 opacity-50 transition-opacity hover:opacity-100 group-hover:opacity-100 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Remove game"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </Button>
      </div>

      {/* Comment */}
      {game.comment && (
        <p className="mt-1 pl-8 text-xs italic text-muted-foreground">
          {game.comment}
        </p>
      )}
    </div>
  );
}

export function GameRow(props: Props) {
  const isTwoPlayer = props.game.scores.length === 2;

  return isTwoPlayer ? (
    <DuelGameRow {...props} />
  ) : (
    <MultiPlayerGameRow {...props} />
  );
}
