import {
  Table2,
  CircleDot,
  Dumbbell,
  Circle,
  Wind,
  Target,
  Crosshair,
  Crown,
  Trophy,
  type LucideProps,
} from "lucide-react";

/** Map of sport slug → Lucide icon component */
const SPORT_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  table_tennis: Table2,
  football: CircleDot,
  basketball: Dumbbell,
  tennis: Circle,
  badminton: Wind,
  volleyball: CircleDot,
  pool: Target,
  darts: Crosshair,
  chess: Crown,
  other: Trophy,
};

/** Fallback icon name → component map (matches the `icon` column value) */
const ICON_NAME_MAP: Record<string, React.ComponentType<LucideProps>> = {
  "table-2": Table2,
  "circle-dot": CircleDot,
  dumbbell: Dumbbell,
  circle: Circle,
  wind: Wind,
  target: Target,
  crosshair: Crosshair,
  crown: Crown,
  trophy: Trophy,
};

type Props = LucideProps & {
  /** The sport's `slug` (preferred) or `icon` column value */
  slug?: string;
  iconName?: string;
};

/**
 * Renders the correct Lucide icon for a sport.
 * Pass `slug` (e.g. "table_tennis") or `iconName` (e.g. "table-2").
 * Falls back to <Trophy> if nothing matches.
 */
export function SportIcon({ slug, iconName, ...props }: Props) {
  const Icon =
    (slug ? SPORT_ICONS[slug] : undefined) ??
    (iconName ? ICON_NAME_MAP[iconName] : undefined) ??
    Trophy;

  return <Icon {...props} />;
}
