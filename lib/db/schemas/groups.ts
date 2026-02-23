import { mysqlTable, serial, timestamp, varchar, text } from 'drizzle-orm/mysql-core';

export const groupsTable = mysqlTable('groups', {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
