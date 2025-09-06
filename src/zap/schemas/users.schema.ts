import { z } from "zod/v4";

import { DEFAULT_PAGE_SIZE } from "../lib/util/constants";

export const InputGetUserIdFromMailSchema = z.object({
  email: z.email("Invalid email address"),
});


// List/Filter Users Schema
export const listUsersSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(DEFAULT_PAGE_SIZE),
  search: z.string().trim().optional(),
  sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Type exports
export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type GetUserIdFromMailInput = z.infer<typeof InputGetUserIdFromMailSchema>;

