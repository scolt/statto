type Props = {
  value: number;
  highlight?: "primary" | "success";
};

const HIGHLIGHT_CLASSES: Record<string, string> = {
  primary: "text-primary font-semibold",
  success: "text-green-600 font-semibold",
};

export function StatsCell({ value, highlight }: Props) {
  const colorClass =
    value > 0 && highlight
      ? HIGHLIGHT_CLASSES[highlight]
      : value > 0
        ? "text-foreground"
        : "text-muted-foreground/40";

  return (
    <span
      className={`text-center font-mono text-xs tabular-nums sm:text-sm ${colorClass}`}
    >
      {value}
    </span>
  );
}
