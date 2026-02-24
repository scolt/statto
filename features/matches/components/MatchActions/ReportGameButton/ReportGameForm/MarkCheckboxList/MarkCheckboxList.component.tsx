"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { UseFormReturn } from "react-hook-form";
import type { Mark } from "@/features/matches";

type FormValues = {
  scores: Record<string, number>;
  markIds: number[];
  comment: string;
};

type Props = {
  marks: Mark[];
  form: UseFormReturn<FormValues>;
};

export function MarkCheckboxList({ marks, form }: Props) {
  const currentMarkIds = form.watch("markIds");

  function toggleMark(markId: number) {
    const current = form.getValues("markIds");
    if (current.includes(markId)) {
      form.setValue(
        "markIds",
        current.filter((id) => id !== markId)
      );
    } else {
      form.setValue("markIds", [...current, markId]);
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Marks</Label>
      <div className="flex flex-wrap gap-x-4 gap-y-2.5">
        {marks.map((mark) => (
          <div key={mark.id} className="flex items-center gap-2">
            <Checkbox
              id={`mark-${mark.id}`}
              checked={currentMarkIds.includes(mark.id)}
              onCheckedChange={() => toggleMark(mark.id)}
            />
            <Label
              htmlFor={`mark-${mark.id}`}
              className="cursor-pointer text-sm"
            >
              {mark.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
