import { generateId } from "better-auth";
import { decimal, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth.sql";


export const customer = pgTable("customers", {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => generateId())
        .notNull(),
    name: text("name").notNull(),
    email: text("email").unique(),
    phoneNumber: text("phone_number").notNull().unique(),
    nationalId: text("national_id").notNull().unique(),
    imgUrl: text("img_url"),
    address: text("address"),
    createdBy: text("created_by").references(() => user.id, {
        onDelete: "set null"
    }),
    createdAt: timestamp("created_at", {
        mode: "string"
    }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
        mode: "string"
    }),
    creditLimit: decimal("credit_limit").notNull().default("0"),
    creditBalance: decimal("credit_balance").notNull().default("0"),
    creditStatus: text("credit_status", { enum: ["ACTIVE", "INACTIVE"] })
        .notNull()
        .default("ACTIVE"),
    status: text("status", { enum: ["ACTIVE", "PENDING", "INACTIVE", "SUSPENDED"] }).notNull().default("ACTIVE"),
});

export type Customer = typeof customer.$inferSelect;
export type NewCustomer = typeof customer.$inferInsert;

// Option 1: As a union type
export type CreditStatus = "ACTIVE" | "INACTIVE";

// Option 2: As a readonly array (if you need a list of values)
export const CREDIT_STATUS = ["ACTIVE", "INACTIVE"] as const;

// Option 1: As a union type
export type CustomerStatus = "ACTIVE" | "PENDING" | "INACTIVE" | "SUSPENDED";

// Option 2: As a readonly array (if you need a list of values)
export const CUSTOMER_STATUS = ["ACTIVE", "PENDING", "INACTIVE", "SUSPENDED"] as const;