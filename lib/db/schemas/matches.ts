import { bigint, int, mysqlEnum, mysqlTable, serial, text, timestamp } from 'drizzle-orm/mysql-core';
import { groupsTable } from './groups';

export const matchesTable = mysqlTable('matches', {
  id: serial().primaryKey(),
  groupId: bigint('group_id', { mode: 'number', unsigned: true })
    .notNull()
    .references(() => groupsTable.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
  /** Accumulated timer duration in seconds. Updated on pause/complete. */
  duration: int('duration').notNull().default(0),
  /** Timestamp when the timer was last resumed (running segment start). Null when paused/stopped. */
  timerStartedAt: timestamp('timer_started_at'),
  status: mysqlEnum('status', ['new', 'in_progress', 'done', 'paused'])
    .notNull()
    .default('new'),
  comment: text(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
