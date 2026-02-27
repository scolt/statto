import type { GameWithDetails } from "@/features/matches";
import { GameRow } from "./GameRow";

type Props = {
  games: GameWithDetails[];
};

export function GameList({ games }: Props) {
  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          No games yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Report a game to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {games.map((game, index) => (
        <GameRow
          key={game.id}
          game={game}
          index={index + 1}
        />
      ))}
    </div>
  );
}
