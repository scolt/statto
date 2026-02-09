import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
const db = drizzle(process.env.MYSQL_PUBLIC_URL);
