import { ReportGameButton } from "./report-game-button";
import { CompleteMatchButton } from "./complete-match-button";
import { StartMatchTimerButton } from "./start-match-timer-button";
import { UncompleteMatchButton } from "./uncomplete-match-button";
import type { MatchPlayer, Mark, MatchStatus } from "@/features/matches";

type Props = {
  matchId: number;
  groupId: number;
  players: MatchPlayer[];
  marks: Mark[];
  status: MatchStatus;
};

export function MatchActions({ matchId, groupId, players, marks, status }: Props) {
  if (status === "new") {
    return (
      <div className="mb-6 flex flex-wrap gap-3">
        <StartMatchTimerButton matchId={matchId} />
      </div>
    );
  }

  if (status === "in_progress") {
    return (
      <div className="mb-6 flex flex-wrap gap-3">
        <ReportGameButton
          matchId={matchId}
          groupId={groupId}
          players={players}
          marks={marks}
        />
        <CompleteMatchButton matchId={matchId} />
      </div>
    );
  }

  // done
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <UncompleteMatchButton matchId={matchId} />
    </div>
  );
}
