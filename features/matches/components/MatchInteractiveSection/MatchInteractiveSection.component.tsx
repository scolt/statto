"use client";

import { useState, useCallback } from "react";
import { MatchComment } from "../MatchComment";
import { ReportGameButton } from "../MatchActions/ReportGameButton";
import { CompleteMatchButton } from "../MatchActions/CompleteMatchButton";
import { StartMatchTimerButton } from "../MatchActions/StartMatchTimerButton";
import { UncompleteMatchButton } from "../MatchActions/UncompleteMatchButton";
import type { MatchPlayer, Mark, MatchStatus, GameWithDetails } from "@/features/matches";

type Props = {
  matchId: number;
  groupId: number;
  players: MatchPlayer[];
  marks: Mark[];
  status: MatchStatus;
  initialComment: string;
  isParticipant: boolean;
  /** Called from MatchPageClient to handle optimistic update + error recovery */
  onGameReported?: (optimisticGame: GameWithDetails, submitFn: () => Promise<void>) => void;
  /** When true the report-game dialog opens automatically (e.g. after an error) */
  forceReportOpen?: boolean;
  /** Error message to display inside the report dialog */
  reportError?: string | null;
  /** Pre-filled game values to restore after a failed submission */
  prefillGame?: GameWithDetails | null;
  onReportErrorDismissed?: () => void;
};

export function MatchInteractiveSection({
  matchId,
  groupId,
  players,
  marks,
  status,
  initialComment,
  isParticipant,
  onGameReported,
  forceReportOpen,
  reportError,
  prefillGame,
  onReportErrorDismissed,
}: Props) {
  const [comment, setComment] = useState(initialComment);

  const handleCommentChange = useCallback((value: string) => {
    setComment(value);
  }, []);

  if (status === "new") {
    return (
      <>
        <MatchComment
          matchId={matchId}
          initialComment={initialComment}
          onChange={handleCommentChange}
          disabled={!isParticipant}
        />
        {isParticipant && (
          <div className="mb-6 flex flex-wrap gap-2">
            <StartMatchTimerButton matchId={matchId} />
          </div>
        )}
      </>
    );
  }

  if (status === "in_progress" || status === "paused") {
    return (
      <>
        <MatchComment
          matchId={matchId}
          initialComment={initialComment}
          onChange={handleCommentChange}
          disabled={!isParticipant}
        />
        {isParticipant && (
          <div className="mb-6 flex flex-wrap gap-2">
            <ReportGameButton
              matchId={matchId}
              groupId={groupId}
              players={players}
              marks={marks}
              onGameReported={onGameReported}
              forceOpen={forceReportOpen}
              error={reportError}
              prefillGame={prefillGame}
              onErrorDismissed={onReportErrorDismissed}
            />
            <CompleteMatchButton matchId={matchId} comment={comment} />
          </div>
        )}
      </>
    );
  }

  // status === "done"
  return (
    <>
      <MatchComment
        matchId={matchId}
        initialComment={initialComment}
        onChange={handleCommentChange}
        disabled={!isParticipant}
      />
      {isParticipant && (
        <div className="mb-6 flex flex-wrap gap-2">
          <UncompleteMatchButton matchId={matchId} />
        </div>
      )}
    </>
  );
}
