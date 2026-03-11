"use server";

import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import {
  insertNotification,
  updateNotificationById,
  findNotificationById,
} from '../repository/notifications.repository';
import type { NotificationConfig, NotificationProvider } from '../types';

export type SaveNotificationState = {
  error?: string;
  success?: boolean;
};

export async function saveNotification(
  groupId: number,
  data: {
    id?: number;
    provider: NotificationProvider;
    enabled: boolean;
    config: NotificationConfig;
  },
): Promise<SaveNotificationState> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Validate config based on provider
  if (data.provider === 'telegram') {
    const chatId = (data.config as { chatId?: string }).chatId?.trim();
    if (!chatId) {
      return { error: 'Chat ID is required.' };
    }
    data.config = { provider: 'telegram', chatId };
  }

  if (data.id) {
    // Update existing
    const existing = await findNotificationById(data.id);
    if (!existing || existing.groupId !== groupId) {
      return { error: 'Notification not found.' };
    }
    await updateNotificationById(data.id, {
      enabled: data.enabled,
      config: data.config,
    });
  } else {
    // Create new
    await insertNotification({
      groupId,
      provider: data.provider,
      enabled: data.enabled,
      config: data.config,
    });
  }

  return { success: true };
}

export async function toggleNotification(
  notificationId: number,
  enabled: boolean,
): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }

  await updateNotificationById(notificationId, { enabled });
}
