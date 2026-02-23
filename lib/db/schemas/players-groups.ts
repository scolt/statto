import { bigint, mysqlTable, primaryKey, timestamp } from 'drizzle-orm/mysql-core';
import { playersTable } from './players';
import { groupsTable } from './groups';

export const playersGroupsTable = mysqlTable(
  'players_groups',
  {
    playerId: bigint({ mode: 'number', unsigned: true })
      .notNull()
      .references(() => playersTable.id, { onDelete: 'cascade' }),
    groupId: bigint({ mode: 'number', unsigned: true })
      .notNull()
      .references(() => groupsTable.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.playerId, table.groupId] }),
  ],
);
