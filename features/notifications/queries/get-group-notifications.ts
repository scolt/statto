"use server";

import { findNotificationsByGroupId } from '../repository/notifications.repository';
import type { GroupNotification } from '../types';

export async function getGroupNotifications(groupId: number): Promise<GroupNotification[]> {
  return findNotificationsByGroupId(groupId);
}
