"use client";

import { useOptimistic, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayerStatsSummary } from "@/features/matches/components/PlayerStatsSummary";
import { MatchInteractiveSection } from "@/features/matches/components/MatchInteractiveSection";
import { GameList } from "@/features/matches/components/GameList";
import { MatchTimer } from "@/features/matches/components/MatchTimer";
import { pauseMatch, resumeMatch } from "@/features/matches";
import type { MatchPlayer, Mark, MatchStatus, GameWithDetails } from "@/features/matches";

type TimerState = {
  status: MatchStatus;
  duration: number;
  timerStartedAt: string | null;
};

type Props = {
  matchId: number;
  groupId: number;
  players: MatchPlayer[];
  marks: Mark[];
  status: MatchStatus;
  duration: number;
  timerStartedAt: string | null;
  initialComment: string;
  initialGames: GameWithDetails[];
  isParticipant: boolean;
};

export function MatchPageClient({
  matchId,
  groupId,
  players,
  marks,
  status,
  duration,
  timerStartedAt,
  initialComment,
  initialGames,
  isParticipant,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Timer optimistic state ─────────────────────────────────────────────────
  const [optimisticTimer, setOptimisticTimer] = useOptimistic<TimerState, Partial<TimerState>>(
    { status, duration, timerStartedAt },
    (current, patch) => ({ ...current, ...patch }),
  );

  function handlePause() {
    // Snapshot elapsed seconds at the moment of the click so the frozen
    // display matches exactly what will be saved on the server.
    const snapshotDuration = timerStartedAt
      ? duration + Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000)
      : duration;

    startTransition(async () => {
      setOptimisticTimer({ status: "paused", duration: snapshotDuration, timerStartedAt: null });
      await pauseMatch(matchId);
      router.refresh();
    });
  }

  function handleResume() {
    const now = new Date().toISOString();
    startTransition(async () => {
      setOptimisticTimer({ status: "in_progress", timerStartedAt: now });
      await resumeMatch(matchId);
      router.refresh();
    });
  }

  // ── Optimistic games list ──────────────────────────────────────────────────
  const [optimisticGames, addOptimisticGame] = useOptimistic(
    initialGames,
    (current, newGame: GameWithDetails) => [newGame, ...current],
  );

  // State for re-opening the report modal on error
  const [reportError, setReportError] = useState<string | null>(null);
  const [pendingGameValues, setPendingGameValues] = useState<GameWithDetails | null>(null);
  const [forceReportOpen, setForceReportOpen] = useState(false);

  function handleGameReported(
    optimisticGame: GameWithDetails,
    submitFn: () => Promise<void>,
  ) {
    setReportError(null);
    setPendingGameValues(null);
    setForceReportOpen(false);

    startTransition(async () => {
      addOptimisticGame(optimisticGame);
      try {
        await submitFn();
        router.refresh();
      } catch (err) {
        // Optimistic entry is rolled back automatically by React.
        // Re-open the modal with the failed values so the user can retry.
        setPendingGameValues(optimisticGame);
        setReportError(
          err instanceof Error ? err.message : "Failed to save game. Please try again.",
        );
        setForceReportOpen(true);
      }
    });
  }

  function handleErrorDismissed() {
    setReportError(null);
    setPendingGameValues(null);
    setForceReportOpen(false);
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const timerVisible =
    optimisticTimer.status === "in_progress" || optimisticTimer.status === "paused";

  return (
    <>
      {/* Timer — fully optimistic, controls only for participants */}
      {timerVisible && (
        <MatchTimer
          duration={optimisticTimer.duration}
          timerStartedAt={optimisticTimer.timerStartedAt}
          status={optimisticTimer.status}
          isPending={isPending}
          onPause={isParticipant ? handlePause : () => {}}
          onResume={isParticipant ? handleResume : () => {}}
          showControls={isParticipant}
        />
      )}

      {/* Player stats — uses optimistic games array */}
      <PlayerStatsSummary
        players={players}
        games={optimisticGames}
        status={optimisticTimer.status}
      />

      {/* Comment + Actions */}
      <MatchInteractiveSection
        matchId={matchId}
        groupId={groupId}
        players={players}
        marks={marks}
        status={status}
        initialComment={initialComment}
        isParticipant={isParticipant}
        onGameReported={handleGameReported}
        forceReportOpen={forceReportOpen}
        reportError={reportError}
        prefillGame={pendingGameValues}
        onReportErrorDismissed={handleErrorDismissed}
      />

      {/* Games list — newest first, uses optimistic array */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Games ({optimisticGames.length})
        </h2>
        <GameList games={optimisticGames} canDelete={isParticipant} />
      </section>
    </>
  );
}
