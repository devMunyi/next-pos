import { generateId } from "better-auth";
import { decimal, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth.sql";

export const expenses = pgTable("expenses", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => generateId())
        .notNull(),
    description: text("description").notNull(),
    amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
    expenseDate: timestamp("expense_date", { mode: "string" }).defaultNow().notNull(),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
});
