import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateGroupButton() {
  return (
    <Button size="sm" className="gap-1.5 rounded-full" asChild>
      <Link href="/create-group" aria-label="Create new group">
        <Plus className="size-4" />
        <span className="hidden sm:inline">New Group</span>
      </Link>
    </Button>
  );
}
