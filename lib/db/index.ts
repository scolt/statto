import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';

// Create MySQL connection pool
const poolConnection = mysql.createPool(process.env.MYSQL_PUBLIC_URL as string);

// Create Drizzle instance
export const db = drizzle(poolConnection);
