// src/zap/db/seed/index.ts

import { desc } from "drizzle-orm";

import { scriptDb } from "@/db/script-db";

import { user } from "../schema/auth.sql";
import { categorySeed } from "./category.seed";
import { unitSeed } from "./unit.seed";
export async function seedDatabase() {
    // Runtime check for server-side execution
    if (typeof window !== "undefined") {
        throw new Error("Seeding must be performed server-side");
    }

    try {
        console.log("🔍 Checking for first user...");
        const users = await scriptDb.select().from(user).orderBy(desc(user.createdAt)).limit(1).execute();
        const firstUser = users[0];

        if (!firstUser) {
            console.warn("⚠️ No first user found. Skipping database seeding.");
            return { success: false, message: "No user found" };
        }

        console.log("🌱 Starting database seeding...");
        await Promise.all([
            unitSeed(firstUser.id),
            categorySeed(firstUser.id),
        ]);

        console.log("✅ Database seeding completed successfully");
        return { success: true };
    } catch (error) {
        console.error("❌ Database seeding failed:", error);
        throw error;
    }
}

// CLI execution handler
if (typeof require !== "undefined" && require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}