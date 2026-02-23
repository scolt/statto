import { bigint, int, mysqlTable, serial, timestamp } from 'drizzle-orm/mysql-core';
import { gamesTable } from './games';
import { playersTable } from './players';

export const gameScoresTable = mysqlTable('game_scores', {
  id: serial().primaryKey(),
  gameId: bigint('game_id', { mode: 'number', unsigned: true })
    .notNull()
    .references(() => gamesTable.id, { onDelete: 'cascade' }),
  playerId: bigint('player_id', { mode: 'number', unsigned: true })
    .notNull()
    .references(() => playersTable.id, { onDelete: 'cascade' }),
  score: int().notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
