import { generateId } from "better-auth";
import { decimal, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth.sql";
import { product } from "./products.sql";

export const stockHistory = pgTable("stock_history", {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => generateId())
        .notNull(),
    product_id: text("product_id")
        .notNull()
        .references(() => product.id, { onDelete: "cascade" }),

    previous_stock: decimal("previous_stock").notNull(),
    new_stock: decimal("new_stock").notNull(),
    change_amount: decimal("change_amount").notNull(),
    changed_by: text("changed_by").references(() => user.id, { onDelete: "set null" }),
    change_reason: text("change_reason").notNull(),
    change_note: text("change_note"),
    change_date: timestamp("change_date", { mode: "string" }).defaultNow().notNull(),
    status: text("status", {
        enum: ["ACTIVE", "INACTIVE"]
    }).notNull().default("ACTIVE")
});


