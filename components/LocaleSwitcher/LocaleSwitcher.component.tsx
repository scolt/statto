'use client';

import { useTransition } from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setLocaleCookie } from '@/i18n/actions';
import { locales, localeNames, type Locale } from '@/i18n/config';

type Props = {
  currentLocale: Locale;
};

export function LocaleSwitcher({ currentLocale }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (locale: Locale) => {
    if (locale === currentLocale) return;
    startTransition(async () => {
      await setLocaleCookie(locale);
    });
  };

  return (
    <div className="space-y-2">
      {locales.map((locale) => {
        const isSelected = locale === currentLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => handleChange(locale)}
            disabled={isPending}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
              isSelected
                ? 'bg-primary/5 border border-primary/20'
                : 'border border-transparent hover:bg-muted'
            } ${isPending ? 'opacity-50' : ''}`}
          >
            <Globe className="size-4 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">
              {localeNames[locale]}
            </span>
            {isSelected && <Check className="size-4 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
