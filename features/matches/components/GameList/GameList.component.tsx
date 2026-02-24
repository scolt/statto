import type { GameWithDetails } from "@/features/matches";
import { GameRow } from "./GameRow";

type Props = {
  games: GameWithDetails[];
};

export function GameList({ games }: Props) {
  if (games.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No games played yet. Report a new game to get started!
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {games.map((game, index) => (
        <GameRow key={game.id} game={game} index={index + 1} />
      ))}
    </div>
  );
}
