import { getTranslations } from "next-intl/server";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Column = {
  emoji: string;
  tooltipKey: string;
};

const COLUMNS: Column[] = [
  { emoji: "🏆", tooltipKey: "leaderboard.matchWins" },
  { emoji: "⚡", tooltipKey: "leaderboard.gameWins" },
  { emoji: "🎮", tooltipKey: "leaderboard.gamesPlayed" },
  { emoji: "🎯", tooltipKey: "leaderboard.totalPoints" },
];

export async function StatsHeader() {
  const t = await getTranslations();

  return (
    <TooltipProvider>
      <div className="grid grid-cols-[1.5rem_1fr_repeat(4,2rem)] items-center gap-1.5 border-b bg-muted/50 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid-cols-[2rem_1fr_repeat(4,2.5rem)] sm:gap-2 sm:px-4 sm:text-xs">
        <span>#</span>
        <span>Player</span>
        {COLUMNS.map((col) => (
          <Tooltip key={col.emoji}>
            <TooltipTrigger asChild>
              <span className="cursor-help text-center">{col.emoji}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{t(col.tooltipKey as keyof IntlMessages)}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
