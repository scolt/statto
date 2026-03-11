"use client";

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveNotification } from '../../actions/save-notification';
import type { GroupNotification, TelegramNotificationConfig } from '../../types';

type Props = {
  groupId: number;
  notification?: GroupNotification | null;
  onSaved: () => void;
  onCancel: () => void;
};

export function TelegramConfigForm({ groupId, notification, onSaved, onCancel }: Props) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [chatId, setChatId] = useState(
    notification?.provider === 'telegram'
      ? (notification.config as TelegramNotificationConfig).chatId
      : '',
  );
  const [error, setError] = useState<string | undefined>();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (!chatId.trim()) {
      setError(t('notifications.telegram.chatIdRequired'));
      return;
    }

    startTransition(async () => {
      const result = await saveNotification(groupId, {
        id: notification?.id,
        provider: 'telegram',
        enabled: notification?.enabled ?? true,
        config: { provider: 'telegram', chatId: chatId.trim() },
      });

      if (result.error) {
        setError(result.error);
      } else {
        onSaved();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg" role="img" aria-label="Telegram">📱</span>
        <h3 className="text-sm font-semibold">
          {t('notifications.provider.telegram')}
        </h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telegram-chat-id">
          {t('notifications.telegram.chatId')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="telegram-chat-id"
          type="text"
          placeholder={t('notifications.telegram.chatIdPlaceholder')}
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          aria-required="true"
        />
        <p className="text-xs text-muted-foreground">
          {t('notifications.telegram.instructions')}
        </p>
      </div>

      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          {isPending ? t('common.saving') : t('common.save')}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
