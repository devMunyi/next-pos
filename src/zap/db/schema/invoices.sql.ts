import { generateId } from "better-auth";
import { decimal, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "@/db/schema";

export const invoice = pgTable("invoices", {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => generateId())
        .notNull(),
    cashierId: text("cashier_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    saleType: text("sale_type", { enum: ["CREDIT", "CASH"] }).notNull(),
    totalAmount: decimal("total_amount").notNull(),
    paidAmount: decimal("paid_amount").notNull(),
    saleProfit: decimal("sale_profit").default("0").notNull(),
    cashBalance: decimal("cash_balance").default("0").notNull(),
    creditBalance: decimal("credit_balance").default("0").notNull(),
    creditDueDate: timestamp("credit_due_date", { mode: "string" }),
    customerPhoneNumber: text("customer_phone_number"),
    status: text("status", {
        enum: ["PAID", "UNPAID", "PARTIALLY_PAID", "CANCELLED"]
    }).notNull().default("UNPAID"),
    createdBy: text("created_by").references(() => user.id, {
        onDelete: "set null"
    }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
});

export type Invoice = typeof invoice.$inferSelect;
export type NewInvoice = typeof invoice.$inferInsert;

// Option 1: As a union type
export type InvoiceStatus = "PAID" | "UNPAID" | "PARTIALLY_PAID" | "CANCELLED";

// Option 2: As a readonly array (if you need a list of values)
export const INVOICE_STATUS = ["PAID", "UNPAID", "PARTIALLY_PAID", "CANCELLED"] as const;