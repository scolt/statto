import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';

const globalForDb = globalThis as unknown as {
  poolConnection?: mysql.Pool;
};

// Reuse existing pool across hot reloads in development
const poolConnection =
  globalForDb.poolConnection ??
  mysql.createPool({
    uri: process.env.MYSQL_PUBLIC_URL as string,
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 60000, // close idle connections after 60s
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.poolConnection = poolConnection;
}

export const db = drizzle(poolConnection);
