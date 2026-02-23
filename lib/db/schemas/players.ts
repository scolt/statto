import { bigint, mysqlTable, serial, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { usersTable } from './users';

export const playersTable = mysqlTable('players', {
  id: serial().primaryKey(),
  userId: bigint({ mode: 'number', unsigned: true }).notNull().references(() => usersTable.id).unique(), // 1:1 relationship with users table, must match serial() type
  nickname: varchar({ length: 100 }).notNull(),
  favouriteSports: text(), // Stored as a JSON string of sports array
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});