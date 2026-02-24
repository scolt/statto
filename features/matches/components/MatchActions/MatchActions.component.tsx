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
      <div className="mb-6 flex flex-wrap gap-2">
        <StartMatchTimerButton matchId={matchId} />
      </div>
    );
  }

  if (status === "in_progress") {
    return (
      <div className="mb-6 flex flex-wrap gap-2">
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

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <UncompleteMatchButton matchId={matchId} />
    </div>
  );
}
