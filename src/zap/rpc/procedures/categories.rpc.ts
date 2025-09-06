// src/zap/rpc/procedures/category.rpc.ts
import "server-only";

import { and, desc, eq, ilike, sql } from "drizzle-orm";

import { category } from "@/db/schema";
import { authMiddleware, base, noAuthMiddleware } from "@/rpc/middlewares";
import { getStringDate } from "@/zap/lib/util/date.util";
import {
    createCategorySchema,
    deleteCategorySchema,
    listCategoriesSchema,
    readCategorySchema,
    updateCategorySchema,
} from "@/zap/schemas/category.schema";

export const categories = {
    addCategory: base
        .use(authMiddleware)
        .input(createCategorySchema)
        .handler(async ({ context: { session, db }, input }) => {
            try {
                const userId = session.user.id;

                await db
                    .insert(category)
                    .values({
                        createdBy: userId,
                        name: input.name,
                        description: input.description || "",
                        status: input.status,
                        createdAt: getStringDate(),
                    })
                    .execute();

                return { success: true };
            } catch (e) {
                console.error("Error adding category:", e);
                return { success: false, message: "Failed to add category" };
            }
        }),

    updateCategory: base
        .use(authMiddleware)
        .input(updateCategorySchema)
        .handler(async ({ context: { session, db }, input }) => {
            try {
                const userId = session.user.id;

                await db
                    .update(category)
                    .set({
                        name: input.name,
                        description: input.description || "",
                        status: input.status,
                        updatedAt: new Date().toISOString(),
                    })
                    .where(and(eq(category.id, input.id!), eq(category.createdBy, userId)))
                    .execute();

                return { success: true };
            } catch (e) {
                console.error("Error updating category:", e);
                return { success: false, message: "Failed to update category" };
            }
        }),

    listCategories: base
        .use(authMiddleware)
        .input(listCategoriesSchema)
        .handler(async ({ context: { db }, input }) => {
            // const userId = session.user.id;
            const { search, page = 1, pageSize = 10 } = input;

            // Build filter conditions
            const searchFilter = search?.trim()
                ? ilike(category.name, `%${search.trim()}%`)
                : undefined;

            const finalFilter = searchFilter ?? undefined;

            try {
                // Run data + count queries in parallel
                const [categoriesResult, countResult] = await Promise.all([
                    db
                        .select()
                        .from(category)
                        .where(finalFilter)
                        .orderBy(desc(category.createdAt))
                        .limit(pageSize)
                        .offset((page - 1) * pageSize)
                        .execute(),

                    db
                        .select({ count: sql<number>`count(*)` })
                        .from(category)
                        .where(finalFilter)
                        .execute(),
                ]);

                const totalCount = countResult[0]?.count ?? 0;

                return {
                    categories: categoriesResult,
                    total: totalCount,
                    page,
                    pageSize,
                    totalPages: Math.ceil(totalCount / pageSize),
                };
            } catch (e) {
                console.error("Error fetching categories:", e);
                return {
                    categories: [],
                    total: 0,
                    page,
                    pageSize,
                    totalPages: 0,
                    message: "Failed to fetch categories",
                };
            }
        }),

    getCategoryById: base
        .use(authMiddleware)
        .input(readCategorySchema.pick({ id: true }))
        .handler(async ({ context: { session, db }, input }) => {
            try {
                const userId = session.user.id;

                const foundCategory = await db
                    .select()
                    .from(category)
                    .where(and(eq(category.id, input.id), eq(category.createdBy, userId)))
                    .execute()
                    .then((categories) => categories[0]);

                return { category: foundCategory };
            } catch (e) {
                console.error("Error getting category:", e);
                return { category: null, message: "Failed to get category" };
            }
        }),

    deleteCategory: base
        .use(authMiddleware)
        .input(deleteCategorySchema)
        .handler(async ({ context: { session, db }, input }) => {
            try {
                const userId = session.user.id;

                await db
                    .delete(category)
                    .where(and(eq(category.id, input.id), eq(category.createdBy, userId)))
                    .execute();

                return { success: true };
            } catch (e) {
                console.error("Error deleting category:", e);
                return { success: false, message: "Failed to delete category" };
            }
        }),

    getAllCategories: base
        .use(noAuthMiddleware)
        .handler(async ({ context: { db } }) => {
            try {
                const categoriesResult: { id: string; name: string }[] = await db
                    .select({
                        id: category.id,
                        name: category.name,
                    })
                    .from(category)
                    .orderBy(category.name)
                    .execute();

                return { categories: categoriesResult };
            } catch (e) {
                console.error("Error fetching all categories:", e);
                return { categories: [], message: "Failed to get categories" };
            }
        }),
};
