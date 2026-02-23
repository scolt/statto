import { Badge } from "@/components/ui/badge";
import type { GameWithDetails } from "@/features/matches";

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
    <div className="space-y-2">
      {games.map((game, index) => (
        <GameRow key={game.id} game={game} index={index + 1} />
      ))}
    </div>
  );
}

function GameRow({ game, index }: { game: GameWithDetails; index: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
      {/* Game number */}
      <span className="text-muted-foreground shrink-0 text-xs font-medium">
        #{index}
      </span>

      {/* Scores */}
      <div className="flex items-center gap-2">
        {game.scores.map((s, i) => (
          <span key={s.playerId} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-muted-foreground mx-1 text-xs">vs</span>
            )}
            <span className="text-muted-foreground text-xs">
              {s.playerName}
            </span>
            <span className="font-mono text-sm font-bold">{s.score}</span>
          </span>
        ))}
      </div>

      {/* Marks */}
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

      {/* Comment */}
      {game.comment && (
        <span className="text-muted-foreground ml-auto truncate text-xs italic">
          {game.comment}
        </span>
      )}
    </div>
  );
}
