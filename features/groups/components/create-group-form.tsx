"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { createGroup } from "../actions/create-group";
import {
  searchPlayers,
  type PlayerSearchResult,
} from "@/features/players";

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

  // Player search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlayerSearchResult[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerSearchResult[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (value.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchPlayers(value);
          const filtered = results.filter(
            (r) => !selectedPlayers.some((s) => s.id === r.id)
          );
          setSuggestions(filtered);
          setShowSuggestions(true);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [selectedPlayers]
  );

  const addPlayer = useCallback((player: PlayerSearchResult) => {
    setSelectedPlayers((prev) => [...prev, player]);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  const removePlayer = useCallback((playerId: number) => {
    setSelectedPlayers((prev) => prev.filter((p) => p.id !== playerId));
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function getPlayerDisplayName(player: PlayerSearchResult) {
    return player.nickname || player.username || `Player #${player.id}`;
  }

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

        {/* Player search */}
        <div className="space-y-2">
          <Label>Add Players</Label>

          {/* Selected players */}
          {selectedPlayers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedPlayers.map((player) => (
                <Badge key={player.id} variant="secondary" className="gap-1">
                  {getPlayerDisplayName(player)}
                  <button
                    type="button"
                    onClick={() => removePlayer(player.id)}
                    className="ml-0.5 rounded-full outline-none hover:bg-muted"
                    aria-label={`Remove ${getPlayerDisplayName(player)}`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Search input */}
          <div ref={wrapperRef} className="relative">
            <Input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() =>
                suggestions.length > 0 && setShowSuggestions(true)
              }
              placeholder="Search by name or username..."
            />
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="text-muted-foreground size-4 animate-spin" />
              </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="bg-popover text-popover-foreground absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border shadow-md">
                {suggestions.map((player) => (
                  <li key={player.id}>
                    <button
                      type="button"
                      onClick={() => addPlayer(player)}
                      className="hover:bg-accent hover:text-accent-foreground w-full px-3 py-2 text-left text-sm transition-colors"
                    >
                      <span className="font-medium">
                        {getPlayerDisplayName(player)}
                      </span>
                      {player.username && (
                        <span className="text-muted-foreground ml-2">
                          @{player.username}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {showSuggestions &&
              !isSearching &&
              suggestions.length === 0 &&
              query.trim().length >= 2 && (
                <div className="bg-popover text-muted-foreground absolute z-10 mt-1 w-full rounded-md border px-3 py-3 text-sm shadow-md">
                  No players found.
                </div>
              )}
          </div>
        </div>

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
