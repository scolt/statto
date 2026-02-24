"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteGroup } from "@/features/groups/actions/delete-group";

type Props = {
  groupId: number;
};

export function DeleteGroupButton({ groupId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this group? All matches and games will be permanently deleted.")) {
      return;
    }

    startTransition(async () => {
      await deleteGroup(groupId);
      router.push("/");
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin text-destructive" />
      ) : (
        <Trash2 className="size-4 text-destructive" />
      )}
    </Button>
  );
}
