import { generateId } from "better-auth";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth.sql";
import { invoice } from "./invoices.sql";


export const creditRepayment = pgTable("credit-repayments", {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => generateId())
        .notNull(),
    invoiceId: text("invoice_id").notNull().references(() => invoice.id, {
        onDelete: "cascade"
    }),
    addedBy: text("added_by").references(() => user.id, { onDelete: "set null" }),
    customerPhoneNumber: text("customer_phone_number"),
    amountPaid: integer("amount").notNull(),
    paymentDate: timestamp("payment_date", { mode: "string" }).defaultNow().notNull(),
    transactionCode: text("transaction_code").unique(),
    creditBalance: integer("credit_balance").notNull(),
    paymentMethod: text("payment_method", {
        enum: ["CASH", "MOBILE_MONEY", "BANK_TRANSFER"]
    }).notNull(),
    createdBy: text("created_by").references(() => user.id, {
        onDelete: "set null"
    }),
    createdAt: timestamp("created_at"
        , { mode: "string" }
    ).defaultNow().notNull(),
    updatedAt: timestamp("updated_at"
        , { mode: "string" }
    ),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    status: text("status", { enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED", "DELETED"] })
        .notNull()
        .default("COMPLETED")
});

export type CreditRepayment = typeof creditRepayment.$inferSelect;
export type CreditRepaymentInsert = typeof creditRepayment.$inferInsert;

// Option 1: As a union type
export type PaymentMethods = "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER";

// Option 2: As a readonly array (if you need a list of values)
export const PAYMENT_METHODS = ["CASH", "MOBILE_MONEY", "BANK_TRANSFER"] as const;