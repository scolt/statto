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
  { emoji: "🏆", tooltip: "Match wins (draws count for all tied players)" },
  { emoji: "⚡", tooltip: "Game wins (total individual games won)" },
  { emoji: "🎮", tooltip: "Total games played" },
  { emoji: "🎯", tooltip: "Total points scored (sum of all game scores)" },
];

export function StatsHeader() {
  return (
    <TooltipProvider>
      <div className="bg-muted/50 grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem] items-center gap-2 rounded-t-lg border-b px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
