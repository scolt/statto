"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Loader2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  searchPlayers,
  type PlayerSearchResult,
} from "@/features/players";

type Props = {
  selectedPlayers: PlayerSearchResult[];
  onAdd: (player: PlayerSearchResult) => void;
  onRemove: (playerId: number) => void;
};

export function PlayerSearchField({ selectedPlayers, onAdd, onRemove }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlayerSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);

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

  function getDisplayName(player: PlayerSearchResult) {
    return player.nickname || player.username || `Player #${player.id}`;
  }

  return (
    <div className="space-y-3">
      <Label>Players</Label>

      {selectedPlayers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPlayers.map((player) => (
            <Badge key={player.id} variant="secondary" className="gap-1 py-1 pl-2.5 pr-1.5">
              {getDisplayName(player)}
              <button
                type="button"
                onClick={() => onRemove(player.id)}
                className="ml-0.5 rounded-full p-0.5 outline-none hover:bg-foreground/10 active:bg-foreground/20"
                aria-label={`Remove ${getDisplayName(player)}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div ref={wrapperRef} className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search by name or username..."
          className="pl-9 pr-9"
        />
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1.5 max-h-48 w-full overflow-y-auto rounded-xl border bg-popover shadow-lg">
            {suggestions.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  onClick={() => {
                    onAdd(player);
                    setQuery("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent active:bg-accent/80"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {getDisplayName(player)[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">
                      {getDisplayName(player)}
                    </span>
                    {player.username && (
                      <span className="ml-2 text-muted-foreground">
                        @{player.username}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {showSuggestions &&
          !isSearching &&
          suggestions.length === 0 &&
          query.trim().length >= 2 && (
            <div className="absolute z-10 mt-1.5 w-full rounded-xl border bg-popover px-3 py-3 text-center text-sm text-muted-foreground shadow-lg">
              No players found.
            </div>
          )}
      </div>
    </div>
  );
}
