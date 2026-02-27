import { bigint, mysqlTable, serial, timestamp, varchar, text } from 'drizzle-orm/mysql-core';
import { sportsTable } from './sports';

export const groupsTable = mysqlTable('groups', {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  /** FK → sports.id  (nullable so existing groups without a sport remain valid) */
  sportId: bigint('sport_id', { mode: 'number', unsigned: true })
    .references(() => sportsTable.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
