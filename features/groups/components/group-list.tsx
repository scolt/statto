import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GroupCard } from "../queries/get-groups-for-user";

type GroupListProps = {
  groups: GroupCard[];
};

export function GroupList({ groups }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        You&apos;re not part of any groups yet. Create one to get started!
      </p>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {groups.map((group) => (
        <Link key={group.id} href={`/groups/${group.id}`}>
          <Card className="w-64 shrink-0 cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="truncate text-lg">{group.name}</CardTitle>
              {group.description && (
                <CardDescription className="line-clamp-3">
                  {group.description}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
