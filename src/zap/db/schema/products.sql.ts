import { generateId } from "better-auth";
import { decimal,integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth.sql";
import { category } from "./category.sql";
import { unit } from "./units.sql";

export const product = pgTable("products", {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => generateId())
        .notNull(),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    categoryId: text("category_id").notNull().references(() => category.id, { onDelete: "cascade" }),
    purchasePrice: decimal("purchase_price", { precision: 20, scale: 2 }).notNull(),
    sellingPrice: decimal("selling_price", { precision: 20, scale: 2 }).notNull(),
    expectedProfit: decimal("expected_profit", { precision: 20, scale: 2 }).notNull().default("0"),
    availableStock: integer("available_stock").notNull().default(0),
    minimumStock: integer("minimum_stock").notNull().default(0),
    unitId: text("unit_id")
        .notNull()
        .references(() => unit.id, { onDelete: "cascade" }),
    imageUrl: text("image_url"),
    status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE"),
});


export type Product = Omit<typeof product.$inferSelect, 'purchasePrice' | 'sellingPrice' | 'expectedProfit'> & {
    purchasePrice: number;
    sellingPrice: number;
    expectedProfit: number
};

export type ProductInsert = typeof product.$inferInsert;

// Option 1: As a union type
export type ProductStatus = "ACTIVE" | "INACTIVE";

// Option 2: As a readonly array (if you need a list of values)
export const PRODUCT_STATUS = ["ACTIVE", "INACTIVE"] as const;