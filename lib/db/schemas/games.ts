import { bigint, mysqlTable, serial, text, timestamp } from 'drizzle-orm/mysql-core';
import { matchesTable } from './matches';

export const gamesTable = mysqlTable('games', {
  id: serial().primaryKey(),
  matchId: bigint('match_id', { mode: 'number', unsigned: true })
    .notNull()
    .references(() => matchesTable.id, { onDelete: 'cascade' }),
  comment: text(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
