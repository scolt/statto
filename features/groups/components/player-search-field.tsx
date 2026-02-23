"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";

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
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
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
    <div className="space-y-2">
      <Label>Players</Label>

      {selectedPlayers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPlayers.map((player) => (
            <Badge key={player.id} variant="secondary" className="gap-1">
              {getDisplayName(player)}
              <button
                type="button"
                onClick={() => onRemove(player.id)}
                className="hover:bg-muted ml-0.5 rounded-full outline-none"
                aria-label={`Remove ${getDisplayName(player)}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div ref={wrapperRef} className="relative">
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search by name or username..."
        />
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="text-muted-foreground size-4 animate-spin" />
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <ul className="bg-popover text-popover-foreground absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border shadow-md">
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
                  className="hover:bg-accent hover:text-accent-foreground w-full px-3 py-2 text-left text-sm transition-colors"
                >
                  <span className="font-medium">{getDisplayName(player)}</span>
                  {player.username && (
                    <span className="text-muted-foreground ml-2">@{player.username}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {showSuggestions && !isSearching && suggestions.length === 0 && query.trim().length >= 2 && (
          <div className="bg-popover text-muted-foreground absolute z-10 mt-1 w-full rounded-md border px-3 py-3 text-sm shadow-md">
            No players found.
          </div>
        )}
      </div>
    </div>
  );
}
