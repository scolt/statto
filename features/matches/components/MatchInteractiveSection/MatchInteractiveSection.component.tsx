"use client";

import { useState, useCallback } from "react";
import { MatchComment } from "../MatchComment";
import { ReportGameButton } from "../MatchActions/ReportGameButton";
import { CompleteMatchButton } from "../MatchActions/CompleteMatchButton";
import { StartMatchTimerButton } from "../MatchActions/StartMatchTimerButton";
import { UncompleteMatchButton } from "../MatchActions/UncompleteMatchButton";
import type { MatchPlayer, Mark, MatchStatus } from "@/features/matches";

type Props = {
  matchId: number;
  groupId: number;
  players: MatchPlayer[];
  marks: Mark[];
  status: MatchStatus;
  initialComment: string;
};

export function MatchInteractiveSection({
  matchId,
  groupId,
  players,
  marks,
  status,
  initialComment,
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
        />
        <div className="mb-6 flex flex-wrap gap-2">
          <StartMatchTimerButton matchId={matchId} />
        </div>
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
        />
        <div className="mb-6 flex flex-wrap gap-2">
          <ReportGameButton
            matchId={matchId}
            groupId={groupId}
            players={players}
            marks={marks}
          />
          <CompleteMatchButton matchId={matchId} comment={comment} />
        </div>
      </>
    );
  }

  // status === "done" — comment is still editable; games are still removable
  return (
    <>
      <MatchComment
        matchId={matchId}
        initialComment={initialComment}
        onChange={handleCommentChange}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <UncompleteMatchButton matchId={matchId} />
      </div>
    </>
  );
}
