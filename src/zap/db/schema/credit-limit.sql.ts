import { generateId } from "better-auth";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth.sql";
import { customer } from "./customers.sql";


export const creditLimit = pgTable("credit_limit", {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => generateId())
        .notNull(),
    customerId: text("customer_id").notNull().references(() => customer.id, {
        onDelete: "cascade"
    }),
    limitAmount: integer("limit_amount").notNull(),
    createdBy: text("created_by").references(() => user.id, {
        onDelete: "set null"
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
    status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE"),
});

export type CreditLimit = typeof creditLimit.$inferSelect;
export type CreditLimitInsert = typeof creditLimit.$inferInsert;

// Option 1: As a union type
export type CreditLimitStatus = "ACTIVE" | "INACTIVE";

// Option 2: As a readonly array (if you need a list of values)
export const CREDIT_LIMIT_STATUS = ["ACTIVE", "INACTIVE"] as const;