"use client";

import { useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { createGroup } from "../../actions/create-group";
import { PlayerSearchField } from "../PlayerSearchField";
import type { PlayerSearchResult } from "@/features/players";

type CreateGroupFormValues = {
  name: string;
  description: string;
};

export function CreateGroupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | undefined>();

  const form = useForm<CreateGroupFormValues>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const [selectedPlayers, setSelectedPlayers] = useState<PlayerSearchResult[]>([]);
  
  const addPlayer = useCallback((player: PlayerSearchResult) => {
    setSelectedPlayers((prev) => [...prev, player]);
  }, []);
  
  const removePlayer = useCallback((playerId: number) => {
    setSelectedPlayers((prev) => prev.filter((p) => p.id !== playerId));
  }, []);

  function onSubmit(values: CreateGroupFormValues) {
    setServerError(undefined);

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("description", values.description);
    formData.set(
      "playerIds",
      JSON.stringify(selectedPlayers.map((p) => p.id))
    );

    startTransition(async () => {
      const result = await createGroup({}, formData);
      if (result?.error) {
        setServerError(result.error);
      }
      // On success the server action redirects
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg space-y-6"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Group name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Group Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Friday Night Football"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What's this group about?"
                  rows={3}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PlayerSearchField
          selectedPlayers={selectedPlayers}
          onAdd={addPlayer}
          onRemove={removePlayer}
        />

        {/* Server error */}
        {serverError && (
          <p className="text-destructive text-sm font-medium">{serverError}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Creating…" : "Create Group"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
