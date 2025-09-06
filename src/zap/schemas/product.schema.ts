import { z } from "zod";

import { stockReasonOptions } from "@/app/(protected)/app/products/fields";

import { capitalizeString } from "../lib/util/common.client.util";
import { DEFAULT_PAGE_SIZE } from "../lib/util/constants";

// Base schema without refinement (used for extension)
const baseProductSchema = z.object({
    code: z.string().trim().min(1, "Code is required").transform((val) => val.toUpperCase()),
    name: z.string().trim().min(1, "Name is required").transform((val) => {
        return capitalizeString(val);
    }),
    description: z.string().trim().nullable(),
    categoryId: z.string().min(1, "Category ID is required"),
    unitId: z.string().min(1, "Unit ID is required"),
    purchasePrice: z.coerce.number().min(1, "Invalid price format"),
    sellingPrice: z.coerce.number().min(1, "Invalid price format"),
    expectedProfit: z.coerce.number().min(0, "Invalid profit format").optional(),
    availableStock: z.coerce.number().int().min(1, "Invalid stock format"),
    minimumStock: z.coerce.number().int().min(0),
    status: z.enum(["ACTIVE", "INACTIVE"])
});

// Create Product Schema (with price validation)
export const createProductSchema = baseProductSchema.refine(
    (data) => data.sellingPrice >= data.purchasePrice,
    {
        message: "Selling price must be greater than or equal to purchase price",
        path: ["sellingPrice"]
    }
);

// Read Product Schema (full document from DB)
export const readProductSchema = baseProductSchema.extend({
    id: z.string(),
    createdBy: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
});

// Update Product Schema (partial updates with ID)
export const updateProductSchema = baseProductSchema
    .extend({
        id: z.string()
    })
    .partial()
    .refine(
        (data) =>
            data.sellingPrice === undefined ||
            data.purchasePrice === undefined ||
            data.sellingPrice >= data.purchasePrice,
        {
            message: "Selling price must be greater than or equal to purchase price",
            path: ["sellingPrice"]
        }
    );

// Delete Product Schema
export const deleteProductSchema = z.object({
    id: z.string()
});

// List/Filter Products Schema
export const listProductsSchema = z.object({
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(100).default(DEFAULT_PAGE_SIZE),
    search: z.string().trim().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    categoryId: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    inStock: z.boolean().optional(),
    sortBy: z.enum(["name", "createdAt", "updatedAt", "sellingPrice"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
});


export const productIds = z.object({
    ids: z.array(z.string()).min(1, "At least one ID is required")
});


const stockReasonValues = stockReasonOptions.map(o => o.value) as [
    typeof stockReasonOptions[number]["value"],
    ...string[]
];

// src/zap/schemas/product.schema.ts
export const updateStockSchema = z.object({
    id: z.string(), // product ID
    availableStock: z.coerce.number().min(0, "Stock cannot be negative"),
    reason: z.enum(stockReasonValues, {
        required_error: "Reason is required"
    }),
    otherReason: z.string().optional(), // only required if reason = OTHER
}).refine((data) => {
    if (data.reason === "OTHER") {
        return !!data.otherReason?.trim();
    }
    return true;
}, {
    message: "Please specify the reason",
    path: ["otherReason"],
});

export type UpdateStockInput = z.infer<typeof updateStockSchema>;

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ReadProductInput = z.infer<typeof readProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
export type ListProductsInput = z.infer<typeof listProductsSchema>;