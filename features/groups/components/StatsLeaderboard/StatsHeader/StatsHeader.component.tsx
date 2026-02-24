import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Column = {
  emoji: string;
  tooltip: string;
};

const COLUMNS: Column[] = [
  { emoji: "🏆", tooltip: "Match wins" },
  { emoji: "⚡", tooltip: "Game wins" },
  { emoji: "🎮", tooltip: "Games played" },
  { emoji: "🎯", tooltip: "Total points" },
];

export function StatsHeader() {
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
              <p className="text-xs">{col.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
