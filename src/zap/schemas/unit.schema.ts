import { z } from "zod";

// capitalize first letter of name, and uppercase the Acronym
export const createUnitSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100).transform((val) => {
        return val.charAt(0).toUpperCase() + val.slice(1);
    }),
    acronym: z.string().trim().max(10).nullable().transform((val) => {
        return val ? val.toUpperCase() : val;
    }),
    description: z.string().trim().max(500).nullable(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
});


// Read Unit Schema (includes all fields from DB)
export const readUnitSchema = createUnitSchema.extend({
    id: z.string(),
    createdBy: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
});

// Update Unit Schema
export const updateUnitSchema = createUnitSchema.extend({
    id: z.string(), // Required for updates
}).partial(); // Make all fields nullable for partial updates

// Delete Unit Schema
export const deleteUnitSchema = z.object({
    id: z.string(), // Only need ID for deletion
});

// List/Filter Units Schema (for queries)
export const listUnitsSchema = z.object({
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(100).default(10),
    search: z.string().trim().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Type exports for TypeScript
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type ReadUnitInput = z.infer<typeof readUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type DeleteUnitInput = z.infer<typeof deleteUnitSchema>;
export type ListUnitsInput = z.infer<typeof listUnitsSchema>;