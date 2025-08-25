// src/zap/db/script-db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

// Create a connection pool without server-only imports
const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Create the drizzle instance for scripts
export const scriptDb = drizzle(pool, { schema });

// Graceful shutdown - Ensure single SIGINT listener
const cleanup = async () => {
    await pool.end();
    process.exit(0);
};

// Check if already attached
if (!process.listeners('SIGINT').includes(cleanup)) {
    process.once('SIGINT', cleanup);  // Use 'once' to automatically remove after execution
}