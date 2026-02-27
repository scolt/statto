"use client";

import { useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { SportSelector } from "@/features/sports";
import type { Sport } from "@/features/sports";

type CreateGroupFormValues = {
  name: string;
  description: string;
};

type Props = {
  sports: Sport[];
};

export function CreateGroupForm({ sports }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | undefined>();

  const form = useForm<CreateGroupFormValues>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const [selectedPlayers, setSelectedPlayers] = useState<PlayerSearchResult[]>(
    []
  );
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);

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
    if (selectedSportId !== null) {
      formData.set("sportId", String(selectedSportId));
    }

    startTransition(async () => {
      const result = await createGroup({}, formData);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: t('groups.groupNameRequired') }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('groups.groupName')} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('groups.groupNamePlaceholder')}
                  {...field}
                />
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
              <FormLabel>{t('groups.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('groups.descriptionPlaceholder')}
                  rows={3}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>{t('groups.sport')}</FormLabel>
          <SportSelector
            sports={sports}
            value={selectedSportId}
            onChange={setSelectedSportId}
          />
        </FormItem>

        <PlayerSearchField
          selectedPlayers={selectedPlayers}
          onAdd={addPlayer}
          onRemove={removePlayer}
        />

        {serverError && (
          <p className="text-sm font-medium text-destructive">{serverError}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? t('common.creating') : t('groups.createGroup')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
