import { mysqlTable, serial, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const marksTable = mysqlTable('marks', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
