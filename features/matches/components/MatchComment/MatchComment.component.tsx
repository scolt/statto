"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Check, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { saveMatchComment, generateAIMatchComment } from "@/features/matches";

type Props = {
  matchId: number;
  initialComment: string;
  onChange: (comment: string) => void;
  disabled?: boolean;
};

export function MatchComment({
  matchId,
  initialComment,
  onChange,
  disabled,
}: Props) {
  const t = useTranslations();
  const [value, setValue] = useState(initialComment);
  const [isFocused, setIsFocused] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onChange(newValue);

      // Debounce auto-save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setSaved(false);

      saveTimeoutRef.current = setTimeout(async () => {
        await saveMatchComment(matchId, newValue || null);
        setSaved(true);

        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
      }, 800);
    },
    [matchId, onChange]
  );

  const handleAIGenerate = async () => {
    if (disabled) return;
    
    try {
      setIsGenerating(true);
      const generatedComment = await generateAIMatchComment(matchId);
      setValue(generatedComment);
      onChange(generatedComment);
      setSaved(true);
      
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error generating AI comment:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {t('notes.title')}
          </span>
          {saved && (
            <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-left-1 duration-200">
              <Check className="size-3" />
              {t('common.saved')}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8" 
          onClick={handleAIGenerate}
          disabled={disabled || isGenerating}
          title={t('notes.generateAI')}
        >
          <Sparkles className="size-4" />
          <span className="sr-only">{t('notes.generateAI')}</span>
        </Button>
      </div>
      <div
        className={`rounded-xl border bg-card transition-all ${
          isFocused
            ? "ring-2 ring-ring/20 border-ring"
            : "hover:border-ring/30"
        }`}
      >
        <Textarea
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('notes.placeholder')}
          disabled={disabled || isGenerating}
          className="min-h-[60px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
          rows={2}
        />
      </div>
    </div>
  );
}