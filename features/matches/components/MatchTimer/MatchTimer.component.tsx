"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Timer, CheckCircle, Clock, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MatchStatus } from "@/features/matches";
import { pauseMatch, resumeMatch } from "@/features/matches";

type Props = {
  matchId: number;
  /** Accumulated seconds already stored in DB. */
  duration: number;
  /** Timestamp (ISO string) of the current running segment, null when paused/stopped. */
  timerStartedAt: string | null;
  status: MatchStatus;
};

function formatElapsed(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function MatchTimer({ matchId, duration, timerStartedAt, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Live-tick counter: base (duration) + current running segment
  const [elapsed, setElapsed] = useState(() => {
    if (timerStartedAt) {
      return duration + Math.floor((Date.now() - new Date(timerStartedAt).getTime()) / 1000);
    }
    return duration;
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear any previous interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (status === "in_progress" && timerStartedAt) {
      const segmentStart = new Date(timerStartedAt).getTime();
      const tick = () =>
        setElapsed(duration + Math.floor((Date.now() - segmentStart) / 1000));
      tick(); // immediate update
      intervalRef.current = setInterval(tick, 1000);
    } else {
      // Paused or done — show stored value
      setElapsed(duration);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, timerStartedAt, status]);

  function handlePause() {
    startTransition(async () => {
      await pauseMatch(matchId);
      router.refresh();
    });
  }

  function handleResume() {
    startTransition(async () => {
      await resumeMatch(matchId);
      router.refresh();
    });
  }

  const isRunning = status === "in_progress";
  const isPaused = status === "paused";
  const isDone = status === "done";
  const isNew = status === "new";

  const icon = isDone ? (
    <CheckCircle className="size-5 text-green-600" />
  ) : isRunning ? (
    <Timer className="size-5 text-primary animate-pulse" />
  ) : isPaused ? (
    <Pause className="size-5 text-amber-500" />
  ) : (
    <Clock className="size-5 text-muted-foreground" />
  );

  const label = isDone
    ? "Completed"
    : isRunning
      ? "In Progress"
      : isPaused
        ? "Paused"
        : "Waiting to Start";

  const bgClass = isRunning
    ? "bg-primary/5 border-primary/20"
    : isPaused
      ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40"
      : "bg-card";

  return (
    <div className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 ${bgClass}`}>
      {icon}
      <div className="flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-mono text-xl font-bold tabular-nums sm:text-2xl">
          {isNew ? "--:--" : formatElapsed(elapsed)}
        </p>
      </div>

      {/* Pause / Resume controls — only visible while match is active */}
      {(isRunning || isPaused) && (
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          disabled={isPending}
          onClick={isRunning ? handlePause : handleResume}
          aria-label={isRunning ? "Pause timer" : "Resume timer"}
        >
          {isRunning ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4 text-amber-500" />
          )}
        </Button>
      )}
    </div>
  );
}
