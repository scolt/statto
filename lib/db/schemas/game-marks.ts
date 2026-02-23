import { bigint, mysqlTable, primaryKey, timestamp } from 'drizzle-orm/mysql-core';
import { gamesTable } from './games';
import { marksTable } from './marks';

export const gameMarksTable = mysqlTable(
  'game_marks',
  {
    gameId: bigint('game_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => gamesTable.id, { onDelete: 'cascade' }),
    markId: bigint('mark_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => marksTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.gameId, table.markId] }),
  ],
);
