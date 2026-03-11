import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';

// ---------------------------------------------------------------------------
// Retry configuration – handles DB cold-start / wake-up delays
// ---------------------------------------------------------------------------
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 10_000; // 10 seconds between attempts

/** Error codes that indicate a transient connection issue worth retrying. */
const RETRYABLE_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'PROTOCOL_CONNECTION_LOST',
  'ER_CON_COUNT_ERROR',
]);

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code && RETRYABLE_CODES.has(code)) return true;
    if (error.message.includes('Connection lost')) return true;
    if (error.message.includes('connect ETIMEDOUT')) return true;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps an async operation with retry logic.
 * On retryable connection errors it waits {@link RETRY_DELAY_MS} ms and
 * retries up to {@link MAX_RETRIES} times. After the final failed attempt
 * it throws an error.
 */
async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const retryable = isRetryableError(error);

      if (retryable && attempt < MAX_RETRIES) {
        console.warn(
          `[db] Connection attempt ${attempt}/${MAX_RETRIES} failed. ` +
            `Retrying in ${RETRY_DELAY_MS / 1000}s…`,
          (error as Error).message,
        );
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      // Final attempt or non-retryable error — throw immediately
      throw new Error(
        `[db] Database connection failed after ${attempt} attempt(s): ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  // Unreachable, satisfies TypeScript
  throw new Error('[db] Unexpected: exhausted all retry attempts');
}

// ---------------------------------------------------------------------------
// Connection pool (reused across hot-reloads in dev)
// ---------------------------------------------------------------------------
const globalForDb = globalThis as unknown as {
  poolConnection?: mysql.Pool;
};

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

// ---------------------------------------------------------------------------
// Wrap pool.query & pool.execute with automatic retry logic so every
// Drizzle operation transparently retries on transient connection failures.
// ---------------------------------------------------------------------------
const originalQuery = poolConnection.query.bind(poolConnection);
const originalExecute = poolConnection.execute.bind(poolConnection);

/* eslint-disable @typescript-eslint/no-explicit-any */
(poolConnection as any).query = function (...args: [any, ...any[]]) {
  return withRetry(() => (originalQuery as any)(...args));
};

(poolConnection as any).execute = function (...args: [any, ...any[]]) {
  return withRetry(() => (originalExecute as any)(...args));
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const db = drizzle(poolConnection);
