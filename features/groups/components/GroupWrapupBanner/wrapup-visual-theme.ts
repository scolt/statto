import type { WrapupStoryPage, WrapupType } from "@/features/groups";
import type { LucideIcon } from "lucide-react";
import { ChartColumnIncreasing, Clock3, Medal, Sparkles } from "lucide-react";

type WrapupSlideVisualTheme = {
  icon: LucideIcon;
  emoji: string;
  accentClass: string;
  badgeClass: string;
  sportVariantClassBySlug?: Record<string, string>;
};

export const WRAPUP_SLIDE_THEME: Record<WrapupStoryPage["id"], WrapupSlideVisualTheme> = {
  "player-stats": {
    icon: ChartColumnIncreasing,
    emoji: "🔥",
    accentClass: "from-amber-400/25 via-orange-300/20 to-rose-300/25",
    badgeClass: "bg-amber-500/15 text-amber-700 border-amber-500/25 dark:text-amber-300",
    sportVariantClassBySlug: {
      football: "from-emerald-400/25 via-lime-300/20 to-yellow-300/25",
      darts: "from-red-400/25 via-orange-300/20 to-amber-300/25",
    },
  },
  time: {
    icon: Clock3,
    emoji: "⏱️",
    accentClass: "from-cyan-400/25 via-sky-300/20 to-indigo-300/25",
    badgeClass: "bg-cyan-500/15 text-cyan-700 border-cyan-500/25 dark:text-cyan-300",
    sportVariantClassBySlug: {
      tennis: "from-blue-400/25 via-cyan-300/20 to-teal-300/25",
    },
  },
  "efficiency-top-3": {
    icon: Medal,
    emoji: "🏆",
    accentClass: "from-fuchsia-400/25 via-violet-300/20 to-indigo-400/25",
    badgeClass: "bg-violet-500/15 text-violet-700 border-violet-500/25 dark:text-violet-300",
    sportVariantClassBySlug: {
      chess: "from-slate-400/25 via-zinc-300/20 to-stone-300/25",
    },
  },
};

export const WRAPUP_TYPE_DECORATION: Record<WrapupType, { labelKey: string; emoji: string; icon: LucideIcon }> = {
  quarter: {
    labelKey: "groups.wrapup.period.quarter",
    emoji: "✨",
    icon: Sparkles,
  },
  year: {
    labelKey: "groups.wrapup.period.year",
    emoji: "🎉",
    icon: Medal,
  },
};
