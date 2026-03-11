import { bigint, boolean, json, mysqlEnum, mysqlTable, serial, timestamp } from 'drizzle-orm/mysql-core';
import { groupsTable } from './groups';

export const groupNotificationsTable = mysqlTable('group_notifications', {
  id: serial().primaryKey(),
  groupId: bigint('group_id', { mode: 'number', unsigned: true })
    .notNull()
    .references(() => groupsTable.id, { onDelete: 'cascade' }),
  provider: mysqlEnum('provider', ['telegram']).notNull(),
  enabled: boolean('enabled').notNull().default(true),
  config: json('config').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
