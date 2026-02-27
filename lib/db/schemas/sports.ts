import { json, mysqlTable, serial, timestamp, varchar } from 'drizzle-orm/mysql-core';

/**
 * Sports reference table.
 * Each sport can carry a JSON `config` blob that will hold sport-specific
 * settings (scoring rules, game formats, etc.) — the shape is intentionally
 * open-ended so it can be extended without schema changes.
 */
export const sportsTable = mysqlTable('sports', {
  id: serial().primaryKey(),
  /** Human-readable name, e.g. "Table Tennis" */
  name: varchar('name', { length: 100 }).notNull(),
  /** URL-safe identifier used in code, e.g. "table_tennis" */
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  /** Lucide icon name, e.g. "table-2", used for display purposes */
  icon: varchar('icon', { length: 100 }).notNull().default('trophy'),
  /** Sport-specific configuration (reserved for future use) */
  config: json('config'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
