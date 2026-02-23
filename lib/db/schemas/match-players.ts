import { bigint, mysqlTable, primaryKey, timestamp } from 'drizzle-orm/mysql-core';
import { matchesTable } from './matches';
import { playersTable } from './players';

export const matchPlayersTable = mysqlTable(
  'match_players',
  {
    matchId: bigint('match_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => matchesTable.id, { onDelete: 'cascade' }),
    playerId: bigint('player_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => playersTable.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.matchId, table.playerId] }),
  ],
);
