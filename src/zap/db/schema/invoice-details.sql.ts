import { generateId } from "better-auth";
import { decimal,integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth.sql";
import { invoice } from "./invoices.sql";
import { product } from "./products.sql";

export const invoiceDetails = pgTable("invoice_details", {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => generateId())
        .notNull(),
    invoiceId: text("invoice_id")
        .notNull()
        .references(() => invoice.id, { onDelete: "cascade" }),
    productId: text("product_id")
        .notNull()
        .references(() => product.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(), // Renamed from 'amount' to 'qty'
    perUnitPrice: decimal("per_unit_price", { precision: 20, scale: 2 }).notNull(), // New column
    totalPrice: decimal("total_price", { precision: 20, scale: 2 }).notNull(), // New column
    saleType: text("sale_type", { enum: ["CREDIT", "CASH"] }).notNull(), // New column
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(), // New column (renamed from created_at)
    updatedAt: timestamp("updated_at", { mode: "string" }), // New column (renamed from updated_at)
    createdBy: text("created_by").references(() => user.id, {
        onDelete: "set null"
    }),
    status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE")
});


export type InvoiceDetails = typeof invoiceDetails.$inferSelect;
export type InvoiceDetailsInsert = typeof invoiceDetails.$inferInsert;

// Option 1: As a union type
export type InvoiceDetailsStatus = "ACTIVE" | "INACTIVE";

// Option 2: As a readonly array (if you need a list of values)
export const INVOICE_DETAILS_STATUS = ["ACTIVE", "INACTIVE"] as const;