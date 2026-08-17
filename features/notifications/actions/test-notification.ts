"use server";

import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { findNotificationById } from '../repository/notifications.repository';
import { telegramProvider } from '../services/providers';
import type { NotificationSender } from '../services/providers';
import type { NotificationProvider } from '../types';

const providerRegistry: Record<NotificationProvider, NotificationSender> = {
  telegram: telegramProvider,
};

export type TestNotificationResult = {
  success: boolean;
  error?: string;
};

export async function testNotification(notificationId: number): Promise<TestNotificationResult> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const notification = await findNotificationById(notificationId);
  if (!notification) {
    return { success: false, error: 'Notification not found.' };
  }

  const sender = providerRegistry[notification.provider];
  if (!sender) {
    return { success: false, error: `Unknown provider: ${notification.provider}` };
  }

  try {
    await sender.send(notification.config as unknown as Record<string, unknown>, {
      groupName: 'Test Group',
      matchId: 0,
      groupId: notification.groupId,
      results: [
        { playerName: 'Tony', wins: 5, isWinner: true },
        { playerName: 'Ulad', wins: 6, isWinner: false },
      ],
      comment: 'Победитель Влад Демонический',
      duration: 4980,
      appBaseUrl: 'https://statto-three.vercel.app//groups/4/matches/72',
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Test notification failed:', message);
    return { success: false, error: message };
  }
}
