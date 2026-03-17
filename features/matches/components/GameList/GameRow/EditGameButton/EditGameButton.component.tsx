"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditGameForm } from "./EditGameForm";
import type { Mark, GameWithDetails } from "@/features/matches";

type Props = {
  game: GameWithDetails;
  marks: Mark[];
};

export function EditGameButton({ game, marks }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleSuccess() {
    setOpen(false);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 opacity-50 transition-opacity hover:opacity-100 group-hover:opacity-100"
          aria-label={t("games.editGame")}
        >
          <Pencil className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("games.editGame")}</DialogTitle>
        </DialogHeader>
        <EditGameForm game={game} marks={marks} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
