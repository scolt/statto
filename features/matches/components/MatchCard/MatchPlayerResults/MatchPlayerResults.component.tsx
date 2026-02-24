import { Trophy } from "lucide-react";
import type { PlayerMatchResult } from "@/features/matches/queries/get-matches-for-group";

type Props = {
  players: PlayerMatchResult[];
};

export function MatchPlayerResults({ players }: Props) {
  return (
    <div className="mt-3 space-y-1 border-t pt-3">
      {players.map((p) => (
        <div key={p.playerId} className="flex items-center gap-2 text-xs">
          {p.isWinner ? (
            <Trophy className="size-3 shrink-0 text-yellow-500" />
          ) : (
            <span className="inline-block size-3 shrink-0" />
          )}
          <span
            className={`min-w-0 truncate ${p.isWinner ? "font-semibold" : "text-muted-foreground"}`}
          >
            {p.nickname}
          </span>
          <span className="ml-auto shrink-0 font-mono tabular-nums">
            <span
              className={
                p.isWinner
                  ? "font-semibold text-green-600"
                  : "text-muted-foreground"
              }
            >
              {p.wins}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
