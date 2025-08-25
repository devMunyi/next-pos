// src/zap/db/seed/unit.seed.ts
import { sql } from "drizzle-orm";

import { db } from "@/db";

import { unit } from "../schema/units.sql";

export async function unitSeed(createdBy: string) {
    // Using transaction for batch insert
    await db.transaction(async (tx) => {
        await tx.insert(unit).values([
            {
                name: "Piece",
                acronym: "pc",
                description: "Individual item",
                createdBy: createdBy,
                createdAt: sql`now()`, // Using PostgreSQL's now() function
            },
            {
                name: "Liter",
                acronym: "l",
                description: "Volume measurement",
                createdBy: createdBy,
                createdAt: sql`now()`,
            },
            {
                name: "Meter",
                acronym: "m",
                description: "Length measurement",
                createdBy: createdBy,
                createdAt: sql`now()`,
            },
            {
                name: "Gram",
                acronym: "g",
                description: "Weight measurement",
                createdBy: createdBy,
                createdAt: sql`now()`,
            },
            {
                name: "Kilogram",
                acronym: "kg",
                description: "Weight measurement, 1000 grams",
                createdBy: createdBy,
                createdAt: sql`now()`,
            }
        ]).onConflictDoNothing(); // Prevents duplicate entries
    });
}


