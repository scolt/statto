"use client";

import { useTranslations } from "next-intl";
import type { GameWithDetails } from "@/features/matches";
import { GameRow } from "./GameRow";

type Props = {
  games: GameWithDetails[];
  canDelete: boolean;
};

export function GameList({ games, canDelete }: Props) {
  const t = useTranslations();

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {t('games.noGames')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {t('games.noGamesHint')}
        </p>
      </div>
    );
  }

  // Show newest game first — reverse a copy so original order is preserved
  const reversed = [...games].reverse();

  return (
    <div className="space-y-2">
      {reversed.map((game, index) => (
        <GameRow
          key={game.id}
          game={game}
          index={games.length - index}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
