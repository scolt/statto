"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Bell, Plus, Trash2, Loader2, Send, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TelegramConfigForm } from '../TelegramConfigForm';
import { deleteNotification } from '../../actions/delete-notification';
import { toggleNotification } from '../../actions/save-notification';
import { testNotification } from '../../actions/test-notification';
import type { GroupNotification, NotificationProvider } from '../../types';

type Props = {
  groupId: number;
  notifications: GroupNotification[];
};

const AVAILABLE_PROVIDERS: { value: NotificationProvider; icon: string }[] = [
  { value: 'telegram', icon: '📱' },
];

export function NotificationSettings({ groupId, notifications: initial }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [editingProvider, setEditingProvider] = useState<NotificationProvider | null>(null);
  const [editingNotification, setEditingNotification] = useState<GroupNotification | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{ id: number; success: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(notificationId: number) {
    if (!confirm(t('notifications.deleteConfirm'))) return;

    setDeletingId(notificationId);
    startTransition(async () => {
      await deleteNotification(notificationId);
      setDeletingId(null);
      router.refresh();
    });
  }

  function handleToggle(notificationId: number, currentEnabled: boolean) {
    startTransition(async () => {
      await toggleNotification(notificationId, !currentEnabled);
      router.refresh();
    });
  }

  function handleTest(notificationId: number) {
    setTestingId(notificationId);
    setTestResult(null);
    startTransition(async () => {
      const result = await testNotification(notificationId);
      setTestResult({ id: notificationId, success: result.success, error: result.error });
      setTestingId(null);
    });
  }

  function handleEdit(notification: GroupNotification) {
    setEditingNotification(notification);
    setEditingProvider(notification.provider);
  }

  function handleSaved() {
    setEditingProvider(null);
    setEditingNotification(null);
    router.refresh();
  }

  function handleCancel() {
    setEditingProvider(null);
    setEditingNotification(null);
  }

  return (
    <section className="space-y-4">
      <Separator />

      <div className="flex items-center gap-2">
        <Bell className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">{t('notifications.title')}</h2>
      </div>

      {/* Existing notification channels */}
      {initial.length === 0 && !editingProvider && (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">{t('notifications.noChannels')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('notifications.noChannelsHint')}</p>
        </div>
      )}

      {initial.map((notification) => (
        <div
          key={notification.id}
          className="flex items-start gap-3 rounded-lg border p-3"
        >
          <span className="mt-0.5 text-lg" role="img" aria-label={notification.provider}>
            {AVAILABLE_PROVIDERS.find((p) => p.value === notification.provider)?.icon ?? '🔔'}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t(`notifications.provider.${notification.provider}`)}
              </span>
              <Badge
                variant={notification.enabled ? 'default' : 'secondary'}
                className="text-[10px] px-1.5 py-0"
              >
                {notification.enabled ? t('notifications.enabled') : t('notifications.disabled')}
              </Badge>
            </div>

            {notification.provider === 'telegram' && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {t('notifications.telegram.chatId')}: {(notification.config as { chatId: string }).chatId}
              </p>
            )}

            {/* Test result message */}
            {testResult && testResult.id === notification.id && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${testResult.success ? 'text-green-600' : 'text-destructive'}`}>
                {testResult.success ? (
                  <><Check className="size-3" /> {t('notifications.testSuccess')}</>
                ) : (
                  <><X className="size-3" /> {testResult.error || t('notifications.testFailed')}</>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Test button */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => handleTest(notification.id)}
              disabled={isPending || !notification.enabled}
              aria-label={t('notifications.testSend')}
            >
              {testingId === notification.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
            </Button>

            {/* Toggle enabled */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => handleToggle(notification.id, notification.enabled)}
              disabled={isPending}
              aria-label={notification.enabled ? t('notifications.disabled') : t('notifications.enabled')}
            >
              {notification.enabled ? (
                <Bell className="size-3.5" />
              ) : (
                <Bell className="size-3.5 text-muted-foreground" />
              )}
            </Button>

            {/* Edit */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => handleEdit(notification)}
              disabled={isPending}
              aria-label={t('common.edit')}
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </Button>

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              onClick={() => handleDelete(notification.id)}
              disabled={isPending}
              aria-label={t('common.delete')}
            >
              {deletingId === notification.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </Button>
          </div>
        </div>
      ))}

      {/* Provider-specific form */}
      {editingProvider === 'telegram' && (
        <TelegramConfigForm
          groupId={groupId}
          notification={editingNotification}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      )}

      {/* Add new notification button */}
      {!editingProvider && (
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_PROVIDERS.map((provider) => (
            <Button
              key={provider.value}
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingNotification(null);
                setEditingProvider(provider.value);
              }}
              className="gap-1.5"
            >
              <Plus className="size-3.5" />
              {t(`notifications.provider.${provider.value}`)}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
