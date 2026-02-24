import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';

const globalForDb = globalThis as unknown as {
  poolConnection?: mysql.Pool;
};

// Reuse existing pool across hot reloads in development
const poolConnection =
  globalForDb.poolConnection ??
  mysql.createPool(process.env.MYSQL_PUBLIC_URL as string);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.poolConnection = poolConnection;
}

export const db = drizzle(poolConnection);
