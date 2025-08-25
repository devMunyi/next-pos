// src/zap/db/seed/category.seed.ts
import { sql } from "drizzle-orm";

import { scriptDb } from "@/db/script-db";

import { category } from "../schema/category.sql";
export async function categorySeed(createdBy: string) {
    // Using transaction for batch insert
    await scriptDb.transaction(async (tx) => {
        await tx.insert(category).values([
            {
                name: "Cereals",
                description: "Grains and cereals",
                createdBy: createdBy,
                createdAt: sql`now()`, // Using PostgreSQL's now() function
            },
            {
                name: "Retail",
                description: "Retail products and services",
                createdBy: createdBy,
                createdAt: sql`now()`,
            },
            {
                name: "Wholesale", // Fixed capitalization
                description: "Wholesale products",
                createdBy: createdBy,
                createdAt: sql`now()`,
            }
        ]).onConflictDoNothing(); // Prevents duplicate entries
    });
}