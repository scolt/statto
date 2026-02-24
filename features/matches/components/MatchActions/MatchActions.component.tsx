import { ReportGameButton } from "./ReportGameButton";
import { CompleteMatchButton } from "./CompleteMatchButton";
import { StartMatchTimerButton } from "./StartMatchTimerButton";
import { UncompleteMatchButton } from "./UncompleteMatchButton";
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
