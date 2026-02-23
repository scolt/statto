import { Badge } from "@/components/ui/badge";
import type { GameWithDetails } from "@/features/matches";

type Props = {
  game: GameWithDetails;
  index: number;
};

export function GameRow({ game, index }: Props) {
  return (
    <div className="rounded-lg border px-3 py-1.5">
      {/* Top line: index, scores, marks */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground shrink-0 text-xs font-medium">
          #{index}
        </span>

        <div className="flex items-center gap-1.5">
          {game.scores.map((s, i) => (
            <span key={s.playerId} className="flex items-center gap-1">
              {i > 0 && (
                <span className="text-muted-foreground text-xs">vs</span>
              )}
              <span className="text-muted-foreground text-xs">
                {s.playerName}
              </span>
              <span className="font-mono text-sm font-bold">{s.score}</span>
            </span>
          ))}
        </div>

        {game.marks.length > 0 && (
          <div className="ml-auto flex flex-wrap gap-1">
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
      </div>

      {/* Second line: comment (only if present) */}
      {game.comment && (
        <p className="text-muted-foreground mt-0.5 pl-6 text-xs italic">
          {game.comment}
        </p>
      )}
    </div>
  );
}
