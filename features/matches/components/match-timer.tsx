"use client";

import { useEffect, useState } from "react";
import { Timer, CheckCircle, Clock } from "lucide-react";
import type { MatchStatus } from "@/features/matches";

type Props = {
  startedAt: string | null; // ISO string or null
  status: MatchStatus;
};

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function MatchTimer({ startedAt, status }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const start = new Date(startedAt).getTime();

    function tick() {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }

    tick();

    if (status !== "in_progress") return;

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, status]);

  const icon =
    status === "done" ? (
      <CheckCircle className="size-5 text-green-600" />
    ) : status === "in_progress" ? (
      <Timer className="text-muted-foreground size-5" />
    ) : (
      <Clock className="text-muted-foreground size-5" />
    );

  const label =
    status === "done"
      ? "Match Completed"
      : status === "in_progress"
        ? "Match Duration"
        : "Waiting to Start";

  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border px-4 py-3">
      {icon}
      <div>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="font-mono text-2xl font-bold tabular-nums">
          {startedAt ? formatElapsed(elapsed) : "--:--"}
        </p>
      </div>
    </div>
  );
}
