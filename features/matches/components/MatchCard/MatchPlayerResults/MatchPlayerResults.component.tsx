import { Trophy } from "lucide-react";
import type { PlayerMatchResult } from "@/features/matches/queries/get-matches-for-group";

type Props = {
  players: PlayerMatchResult[];
};

export function MatchPlayerResults({ players }: Props) {
  return (
    <div className="mt-1.5 space-y-0.5">
      {players.map((p) => (
        <div
          key={p.playerId}
          className="flex items-center gap-1.5 text-xs"
        >
          {p.isWinner ? (
            <Trophy className="size-3 shrink-0 text-yellow-500" />
          ) : (
            <span className="inline-block size-3 shrink-0" />
          )}
          <span
            className={`truncate ${p.isWinner ? "font-semibold" : "text-muted-foreground"}`}
          >
            {p.nickname}
          </span>
          <span className="text-muted-foreground">—</span>
          <span
            className={`font-mono tabular-nums ${
              p.isWinner ? "font-semibold text-green-600" : "text-muted-foreground"
            }`}
          >
            {p.wins}
          </span>
        </div>
      ))}
    </div>
  );
}
