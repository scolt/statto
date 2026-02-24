import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { GroupCard } from "../../queries/get-groups-for-user";

type GroupListProps = {
  groups: GroupCard[];
};

export function GroupList({ groups }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center">
        {/* IMAGE_HERE: Empty state illustration — friendly character holding a trophy, soft violet tones, minimalist line art style, 240x240 */}
        <Users className="mb-3 size-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">
          No groups yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Create one to start tracking stats!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {groups.map((group) => (
        <Link key={group.id} href={`/groups/${group.id}`}>
          <div className="card-hover flex items-center gap-4 rounded-2xl border bg-card p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
              {group.name[0]?.toUpperCase() ?? "G"}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold">{group.name}</h3>
              {group.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {group.description}
                </p>
              )}
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground/40" />
          </div>
        </Link>
      ))}
    </div>
  );
}
