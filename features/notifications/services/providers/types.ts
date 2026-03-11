import type { NotificationPayload } from '../../types';

export type NotificationSender = {
  send(config: Record<string, unknown>, payload: NotificationPayload): Promise<void>;
};
