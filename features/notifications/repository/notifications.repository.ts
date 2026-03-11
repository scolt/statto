import { db } from '@/lib/db';
import { groupNotificationsTable } from '@/lib/db/schemas/group-notifications';
import { eq, and } from 'drizzle-orm';
import type { NotificationConfig, NotificationProvider, GroupNotification } from '../types';

export async function findNotificationsByGroupId(groupId: number): Promise<GroupNotification[]> {
  const rows = await db
    .select({
      id: groupNotificationsTable.id,
      groupId: groupNotificationsTable.groupId,
      provider: groupNotificationsTable.provider,
      enabled: groupNotificationsTable.enabled,
      config: groupNotificationsTable.config,
    })
    .from(groupNotificationsTable)
    .where(eq(groupNotificationsTable.groupId, groupId));

  return rows.map((row) => ({
    ...row,
    config: row.config as NotificationConfig,
  }));
}

export async function findEnabledNotificationsByGroupId(groupId: number): Promise<GroupNotification[]> {
  const rows = await db
    .select({
      id: groupNotificationsTable.id,
      groupId: groupNotificationsTable.groupId,
      provider: groupNotificationsTable.provider,
      enabled: groupNotificationsTable.enabled,
      config: groupNotificationsTable.config,
    })
    .from(groupNotificationsTable)
    .where(
      and(
        eq(groupNotificationsTable.groupId, groupId),
        eq(groupNotificationsTable.enabled, true),
      ),
    );

  return rows.map((row) => ({
    ...row,
    config: row.config as NotificationConfig,
  }));
}

export async function findNotificationById(id: number): Promise<GroupNotification | null> {
  const rows = await db
    .select({
      id: groupNotificationsTable.id,
      groupId: groupNotificationsTable.groupId,
      provider: groupNotificationsTable.provider,
      enabled: groupNotificationsTable.enabled,
      config: groupNotificationsTable.config,
    })
    .from(groupNotificationsTable)
    .where(eq(groupNotificationsTable.id, id))
    .limit(1);

  if (!rows[0]) return null;

  return {
    ...rows[0],
    config: rows[0].config as NotificationConfig,
  };
}

export async function insertNotification(data: {
  groupId: number;
  provider: NotificationProvider;
  enabled: boolean;
  config: NotificationConfig;
}): Promise<number> {
  const [result] = await db.insert(groupNotificationsTable).values({
    groupId: data.groupId,
    provider: data.provider,
    enabled: data.enabled,
    config: data.config,
  });
  return result.insertId;
}

export async function updateNotificationById(
  id: number,
  data: {
    enabled?: boolean;
    config?: NotificationConfig;
  },
): Promise<void> {
  await db
    .update(groupNotificationsTable)
    .set(data)
    .where(eq(groupNotificationsTable.id, id));
}

export async function deleteNotificationById(id: number): Promise<void> {
  await db
    .delete(groupNotificationsTable)
    .where(eq(groupNotificationsTable.id, id));
}
