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

import { updateGroup } from "../actions/update-group";
import { PlayerSearchField } from "./player-search-field";
import type { PlayerSearchResult } from "@/features/players";

type EditGroupFormValues = {
  name: string;
  description: string;
};

type Props = {
  groupId: number;
  initialName: string;
  initialDescription: string;
  initialPlayers: PlayerSearchResult[];
};

export function EditGroupForm({
  groupId,
  initialName,
  initialDescription,
  initialPlayers,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | undefined>();
  const [selectedPlayers, setSelectedPlayers] =
    useState<PlayerSearchResult[]>(initialPlayers);

  const form = useForm<EditGroupFormValues>({
    defaultValues: {
      name: initialName,
      description: initialDescription,
    },
  });

  const addPlayer = useCallback((player: PlayerSearchResult) => {
    setSelectedPlayers((prev) => [...prev, player]);
  }, []);

  const removePlayer = useCallback((playerId: number) => {
    setSelectedPlayers((prev) => prev.filter((p) => p.id !== playerId));
  }, []);

  function onSubmit(values: EditGroupFormValues) {
    setServerError(undefined);

    startTransition(async () => {
      const result = await updateGroup(groupId, {
        name: values.name,
        description: values.description,
        playerIds: selectedPlayers.map((p) => p.id),
      });

      if (result.error) {
        setServerError(result.error);
      } else {
        router.push(`/groups/${groupId}`);
        router.refresh();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-6">
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
                <Input placeholder="e.g. Friday Night Football" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {serverError && (
          <p className="text-destructive text-sm font-medium">{serverError}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/groups/${groupId}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
