// import "server-only";

// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";

// import { ENV } from "@/lib/env.server";

// import * as schema from "./schema";

// const sql = neon(ENV.DATABASE_URL);
// export const db = drizzle({ client: sql, schema });


import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { ENV } from "@/lib/env.server";

import * as schema from "./schema";

// Create a connection pool
const pool = new Pool({
    connectionString: ENV.DATABASE_URL,
    // Optional: Add connection pool settings
    max: 20, // maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Create the drizzle instance
export const db = drizzle(pool, { schema });

// Optional: Handle graceful shutdown
// Graceful shutdown - Ensure single SIGINT listener
const cleanup = async () => {
    await pool.end();
    process.exit(0);
};

// Check if already attached
if (!process.listeners('SIGINT').includes(cleanup)) {
    process.once('SIGINT', cleanup);  // Use 'once' to automatically remove after execution
}