import { generateId } from "better-auth";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth.sql";

export const category = pgTable("categories", {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => generateId())
        .notNull(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE"),
});