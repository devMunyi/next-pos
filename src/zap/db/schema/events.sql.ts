import { generateId } from "better-auth";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth.sql";


export const event = pgTable("events", {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => generateId())
        .notNull(),
    table_name: text("table_name").notNull(),
    field_id: text("field_id").notNull(),
    event_details: text("event_details").notNull(),
    event_date: timestamp("event_date", { mode: "string" }).defaultNow().notNull(),
    event_by: text("event_by").references(() => user.id, { onDelete: "set null" }),
    status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE"),
});