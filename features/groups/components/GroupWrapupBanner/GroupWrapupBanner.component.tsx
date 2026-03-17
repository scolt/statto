"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ActiveGroupWrapup, WrapupStoryPage } from "@/features/groups";
import {
  WRAPUP_SLIDE_THEME,
  WRAPUP_TYPE_DECORATION,
} from "./wrapup-visual-theme";

type Props = {
  wrapup: ActiveGroupWrapup;
};

function formatDuration(seconds: number): { key: string; params?: { hours: number; minutes: number } | { minutes: number } } {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return { key: "duration.hours", params: { hours: hrs, minutes: mins } };
  if (mins > 0) return { key: "duration.minutes", params: { minutes: mins } };
  return { key: "duration.lessThanMinute" };
}

export function GroupWrapupBanner({ wrapup }: Props) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [imageFallback, setImageFallback] = useState<Record<string, true>>({});

  const pages = wrapup.pages;
  const hasPages = pages.length > 0;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setPageIndex((current) => Math.min(current + 1, pages.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setPageIndex((current) => Math.max(current - 1, 0));
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, pages.length]);

  if (!wrapup.banner.isActive || !hasPages || !wrapup.banner.periodLabel) {
    return null;
  }

  const currentPage = pages[pageIndex];
  const periodVisual = wrapup.banner.type
    ? WRAPUP_TYPE_DECORATION[wrapup.banner.type]
    : null;
  const pageVisual = WRAPUP_SLIDE_THEME[currentPage.id];
  const imageKey = wrapup.banner.type
    ? `${wrapup.banner.type}:${currentPage.id}`
    : `none:${currentPage.id}`;

  return (
    <>
      <div className="border-b bg-primary/5">
        <div className="mx-auto w-full max-w-2xl px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setPageIndex(0);
              setIsOpen(true);
            }}
            className="flex w-full items-center justify-between rounded-xl border bg-card px-3 py-2 text-left transition hover:border-primary/40"
            aria-label={t("groups.wrapup.openViewer")}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              {periodVisual && <periodVisual.icon className="size-4 text-primary" />}
              {t("groups.wrapup.bannerReady", { period: wrapup.banner.periodLabel })}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t("groups.wrapup.open")}
            </span>
          </button>
        </div>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setPageIndex(0);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-h-[90vh] max-w-2xl overflow-hidden p-0 sm:max-w-2xl"
        >
          <div className={`relative flex h-full flex-col bg-card wrapup-story-shell bg-gradient-to-br ${pageVisual.accentClass}`}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {wrapup.banner.periodLabel}
                </p>
                <DialogTitle className="text-base">
                  {t("groups.wrapup.storyTitle")}
                </DialogTitle>
                {periodVisual && (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full border bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <periodVisual.icon className="size-3" />
                    <span>{periodVisual.emoji}</span>
                    {t(periodVisual.labelKey as keyof IntlMessages)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label={t("groups.wrapup.close")}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <div className="relative">
                <div className="relative wrapup-story-content">
                  {renderPage(currentPage, t, pageVisual.emoji, pageVisual.badgeClass)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
              <Button
                variant="outline"
                onClick={() => setPageIndex((current) => Math.max(current - 1, 0))}
                disabled={pageIndex === 0}
                aria-label={t("groups.wrapup.previous")}
              >
                <ChevronLeft className="mr-1 size-4" />
                {t("groups.wrapup.previous")}
              </Button>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("groups.wrapup.pageIndicator", {
                  current: pageIndex + 1,
                  total: pages.length,
                })}
              </p>
              <Button
                onClick={() => {
                  if (pageIndex === pages.length - 1) {
                    setIsOpen(false);
                    return;
                  }
                  setPageIndex((current) => Math.min(current + 1, pages.length - 1));
                }}
                aria-label={
                  pageIndex === pages.length - 1
                    ? t("groups.wrapup.close")
                    : t("groups.wrapup.next")
                }
              >
                {pageIndex === pages.length - 1 ? t("groups.wrapup.close") : t("groups.wrapup.next")}
                {pageIndex !== pages.length - 1 && <ChevronRight className="ml-1 size-4" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function renderPage(
  page: WrapupStoryPage,
  t: ReturnType<typeof useTranslations>,
  emojiAccent: string,
  badgeClass: string
) {
  if (page.id === "player-stats") {
    return (
      <div>
        <div className="mb-4 wrapup-card wrapup-card-hero p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("groups.wrapup.pages.playerStats.totalMatches")}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">{page.totalMatches}</p>
          <p className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeClass}`}>
            <span>{emojiAccent}</span>
            {t("groups.wrapup.pages.playerStats.heroChip")}
          </p>
        </div>

        <p className="mb-3 text-sm font-semibold">{t("groups.wrapup.pages.playerStats.title")}</p>
        <div className="overflow-hidden rounded-2xl border bg-card/95 backdrop-blur-sm">
          <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr] border-b px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>{t("groups.wrapup.pages.playerStats.player")}</span>
            <span className="text-right">{t("groups.wrapup.pages.playerStats.matches")}</span>
            <span className="text-right">{t("groups.wrapup.pages.playerStats.games")}</span>
            <span className="text-right">{t("groups.wrapup.pages.playerStats.wins")}</span>
          </div>

          {page.players.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">{t("groups.wrapup.noData")}</p>
          ) : (
            page.players.map((player, index) => (
              <div
                key={player.playerId}
                className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr] border-b px-4 py-3 last:border-b-0"
              >
                <p className="truncate text-sm font-medium">{index + 1}. {player.nickname}</p>
                <p className="text-right text-sm font-semibold">{player.matchesPlayed}</p>
                <p className="text-right text-sm font-semibold">{player.gamesPlayed}</p>
                <p className="text-right text-sm font-semibold text-primary">{player.wins}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (page.id === "time") {
    const total = formatDuration(page.totalPlaySeconds);
    const avgGame = formatDuration(page.averageGameSeconds);
    const avgMatch = formatDuration(page.averageMatchSeconds);

    return (
      <div>
        <p className="mb-3 text-sm font-semibold">{t("groups.wrapup.pages.time.title")}</p>
        <div className="space-y-3">
          <div className="wrapup-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("groups.wrapup.pages.time.totalPlay")}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {total.params
                ? t(total.key as keyof IntlMessages, total.params)
                : t(total.key as keyof IntlMessages)}
            </p>
            <p className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeClass}`}>
              <span>{emojiAccent}</span>
              {t("groups.wrapup.pages.time.chipTotal")}
            </p>
          </div>
          <div className="wrapup-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("groups.wrapup.pages.time.avgGame")}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {avgGame.params
                ? t(avgGame.key as keyof IntlMessages, avgGame.params)
                : t(avgGame.key as keyof IntlMessages)}
            </p>
          </div>
          <div className="wrapup-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("groups.wrapup.pages.time.avgMatch")}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {avgMatch.params
                ? t(avgMatch.key as keyof IntlMessages, avgMatch.params)
                : t(avgMatch.key as keyof IntlMessages)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Trophy className="size-4 text-primary" />
        {t("groups.wrapup.pages.efficiency.title")}
      </p>
      <div className="overflow-hidden rounded-2xl border bg-card/95 backdrop-blur-sm">
        {page.players.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">{t("groups.wrapup.noData")}</p>
        ) : (
          page.players.map((player, index) => (
            <div key={player.playerId} className="border-b px-4 py-3 last:border-b-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{index + 1}. {player.nickname}</p>
                <p className="text-sm font-semibold text-primary">{player.winRate}%</p>
              </div>
              <p className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeClass}`}>
                <span>{emojiAccent}</span>
                {t("groups.wrapup.pages.efficiency.chipTop")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("groups.wrapup.pages.efficiency.meta", {
                  wins: player.wins,
                  games: player.gamesPlayed,
                  percentile: player.percentile,
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
