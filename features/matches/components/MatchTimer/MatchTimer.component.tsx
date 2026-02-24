"use client";

import { useEffect, useState } from "react";
import { Timer, CheckCircle, Clock } from "lucide-react";
import type { MatchStatus } from "@/features/matches";

type Props = {
  startedAt: string | null;
  finishedAt: string | null;
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

function computeElapsed(startedAt: string, finishedAt: string | null): number {
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  return Math.floor((end - start) / 1000);
}

export function MatchTimer({ startedAt, finishedAt, status }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    setElapsed(computeElapsed(startedAt, finishedAt));

    if (status !== "in_progress") return;

    const interval = setInterval(() => {
      setElapsed(computeElapsed(startedAt, null));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, finishedAt, status]);

  const icon =
    status === "done" ? (
      <CheckCircle className="size-5 text-green-600" />
    ) : status === "in_progress" ? (
      <Timer className="size-5 text-primary" />
    ) : (
      <Clock className="size-5 text-muted-foreground" />
    );

  const label =
    status === "done"
      ? "Completed"
      : status === "in_progress"
        ? "In Progress"
        : "Waiting to Start";

  const bgClass =
    status === "in_progress"
      ? "bg-primary/5 border-primary/20"
      : "bg-card";

  return (
    <div
      className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 ${bgClass}`}
    >
      {icon}
      <div className="flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-mono text-xl font-bold tabular-nums sm:text-2xl">
          {startedAt ? formatElapsed(elapsed) : "--:--"}
        </p>
      </div>
    </div>
  );
}
