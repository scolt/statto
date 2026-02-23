import type { Config } from 'drizzle-kit';

export default {
  schema: ['./lib/db/schema.ts', './lib/db/relations.ts'],
  out: './lib/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.MYSQL_PUBLIC_URL!,
  },
} satisfies Config;
