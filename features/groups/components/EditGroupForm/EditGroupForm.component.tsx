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

import { updateGroup } from "../../actions/update-group";
import { PlayerSearchField } from "../PlayerSearchField";
import type { PlayerSearchResult } from "@/features/players";
import { SportSelector } from "@/features/sports";
import type { Sport } from "@/features/sports";

type EditGroupFormValues = {
  name: string;
  description: string;
};

type Props = {
  groupId: number;
  initialName: string;
  initialDescription: string;
  initialPlayers: PlayerSearchResult[];
  initialSportId: number | null;
  sports: Sport[];
};

export function EditGroupForm({
  groupId,
  initialName,
  initialDescription,
  initialPlayers,
  initialSportId,
  sports,
}: Props) {
  const router = useRouter();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | undefined>();
  const [selectedPlayers, setSelectedPlayers] =
    useState<PlayerSearchResult[]>(initialPlayers);
  const [selectedSportId, setSelectedSportId] = useState<number | null>(initialSportId);

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
        sportId: selectedSportId,
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
                <Input placeholder={t('groups.groupNamePlaceholder')} {...field} />
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
            {isPending ? t('common.saving') : t('profile.saveChanges')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/groups/${groupId}`)}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
