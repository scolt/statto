"use client";

import { SportIcon } from "@/features/sports";
import type { Sport } from "@/features/sports";
import { cn } from "@/lib/utils";

type Props = {
  sports: Sport[];
  value: number | null;
  onChange: (sportId: number | null) => void;
};

export function SportSelector({ sports, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {sports.map((sport) => {
        const selected = value === sport.id;
        return (
          <button
            key={sport.id}
            type="button"
            onClick={() => onChange(selected ? null : sport.id)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
              "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground"
            )}
          >
            <SportIcon
              slug={sport.slug}
              iconName={sport.icon}
              className={cn("size-4 shrink-0", selected ? "text-primary" : "text-muted-foreground")}
            />
            <span className="truncate">{sport.name}</span>
          </button>
        );
      })}
    </div>
  );
}
