import { findEnabledNotificationsByGroupId } from '../repository/notifications.repository';
import { telegramProvider } from './providers';
import type { NotificationSender } from './providers';
import type { NotificationPayload, NotificationProvider } from '../types';

const providerRegistry: Record<NotificationProvider, NotificationSender> = {
  telegram: telegramProvider,
};

/**
 * Dispatches notifications to all enabled providers for a given group.
 * Uses Promise.allSettled so one failing provider never blocks others.
 */
export async function dispatchNotifications(
  groupId: number,
  payload: NotificationPayload,
): Promise<void> {
  const notifications = await findEnabledNotificationsByGroupId(groupId);
  if (notifications.length === 0) return;

  const results = await Promise.allSettled(
    notifications.map((n) => {
      const sender = providerRegistry[n.provider];
      if (!sender) {
        return Promise.reject(new Error(`Unknown provider: ${n.provider}`));
      }
      return sender.send(n.config as unknown as Record<string, unknown>, payload);
    }),
  );

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`Notification ${notifications[i].id} (${notifications[i].provider}) failed:`, r.reason);
    }
  });
}
