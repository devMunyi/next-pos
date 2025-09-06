import { z } from "zod";

import { DEFAULT_PAGE_SIZE } from "../lib/util/constants";



export const createCategoryFormSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    description: z.string().trim().max(500).nullable(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
});

// capitalize first letter of name
export const createCategorySchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).transform((val) => {
        return val.charAt(0).toUpperCase() + val.slice(1);
    }),
    description: z.string().trim().max(500).nullable(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
});

// Read Category Schema (includes all fields from DB)
export const readCategorySchema = createCategorySchema.extend({
    id: z.string(),
    createdBy: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
});

// Update Category Schema
export const updateCategorySchema = createCategorySchema.extend({
    id: z.string(), // Required for updates
}).partial(); // Make all fields optional for partial updates

// Delete Category Schema
export const deleteCategorySchema = z.object({
    id: z.string(), // Only need ID for deletion
});

// List/Filter Categories Schema (for queries)
export const listCategoriesSchema = z.object({
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(100).default(DEFAULT_PAGE_SIZE),
    search: z.string().trim().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Type exports for TypeScript
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type ReadCategoryInput = z.infer<typeof readCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type ListCategoriesInput = z.infer<typeof listCategoriesSchema>;