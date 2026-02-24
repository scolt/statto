"use client";

import { useState, useCallback } from "react";
import { MessageSquare } from "lucide-react";
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

  if (status === "in_progress") {
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

  // status === "done" — show comment as read-only if it exists
  return (
    <>
      {initialComment && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Match Notes
            </span>
          </div>
          <div className="rounded-xl border bg-muted/30 px-4 py-3">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {initialComment}
            </p>
          </div>
        </div>
      )}
      <div className="mb-6 flex flex-wrap gap-2">
        <UncompleteMatchButton matchId={matchId} />
      </div>
    </>
  );
}
