import { generateId } from "better-auth";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth.sql";

export const unit = pgTable("units", {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => generateId())
        .notNull(),
    name: text("name").notNull(),
    acronym: text("acronym"),
    description: text("description"),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
    status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE")
});

export type Unit = typeof unit.$inferSelect;
export type NewUnit = typeof unit.$inferInsert;

// Option 1: As a union type
export type UnitStatus = "ACTIVE" | "INACTIVE";

// Option 2: As a readonly array (if you need a list of values)
export const UNIT_STATUS = ["ACTIVE", "INACTIVE"] as const;