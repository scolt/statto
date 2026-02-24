import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateGroupButton() {
  return (
    <Button size="icon" className="rounded-full" asChild>
      <Link href="/create-group" aria-label="Create new group">
        <Plus className="size-5" />
      </Link>
    </Button>
  );
}
