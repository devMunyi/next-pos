// src/zap/rpc/procedures/product.rpc.ts
import "server-only";

import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";

import { category, product, ProductInsert, stockHistory, unit } from "@/db/schema";
import { authMiddleware, base, noAuthMiddleware } from "@/rpc/middlewares";
import { storeChangeLog } from "@/zap/lib/util/common.server.util";
import {
    createProductSchema,
    deleteProductSchema,
    listProductsSchema,
    productIds,
    readProductSchema,
    updateProductSchema,
    updateStockSchema
} from "@/zap/schemas/product.schema";

export const products = {
    createProduct: base
        .use(authMiddleware)
        .input(createProductSchema)
        .handler(async ({ context: { session, db }, input }) => {
            try {
                const userId = session.user.id;

                const resp = await db.insert(product).values({
                    createdBy: userId,
                    createdAt: new Date().toISOString(),
                    ...input,
                    purchasePrice: String(input.purchasePrice),
                    sellingPrice: String(input.sellingPrice),
                    expectedProfit: String(input.sellingPrice - input.purchasePrice),
                }).returning({ id: product.id, availableStock: product.availableStock }).execute();

                if (resp.length > 0) {
                    await db.insert(stockHistory).values({
                        product_id: resp[0].id,
                        previous_stock: "0",
                        new_stock: String(resp[0].availableStock ?? 0),
                        change_amount: String((resp[0].availableStock ?? 0) - 0),
                        changed_by: userId,
                        change_reason: "NEW_STOCK",
                        change_note: "Initial stock on product creation",
                        status: "ACTIVE",
                    });
                }

                return { success: true, message: "Product created successfully" };
            } catch (e) {
                return {
                    success: false,
                    message: e instanceof Error ? e.message : "Failed to create product",
                };
            }
        }),

    updateProduct: base
        .use(authMiddleware)
        .input(updateProductSchema)
        .handler(async ({ context: { db, session }, input }) => {
            try {
                const userId = session.user.id;
                if (!input.id) {
                    return { success: false, message: "Product ID is required for update" };
                }

                const updateData: Partial<ProductInsert> = {};

                if (input.name !== undefined) updateData.name = input.name;
                if (input.description !== undefined)
                    updateData.description = input.description;
                if (input.categoryId !== undefined)
                    updateData.categoryId = input.categoryId;
                if (input.unitId !== undefined) updateData.unitId = input.unitId;
                if (input.status !== undefined) updateData.status = input.status;
                if (input.minimumStock !== undefined)
                    updateData.minimumStock = input.minimumStock;
                if (input.availableStock !== undefined)
                    updateData.availableStock = input.availableStock;

                if (input.purchasePrice !== undefined) {
                    updateData.purchasePrice = String(input.purchasePrice);
                    if (input.sellingPrice !== undefined) {
                        updateData.expectedProfit = String(
                            input.sellingPrice - input.purchasePrice
                        );
                    }
                }

                if (input.sellingPrice !== undefined) {
                    updateData.sellingPrice = String(input.sellingPrice);
                    if (input.purchasePrice !== undefined) {
                        updateData.expectedProfit = String(
                            input.sellingPrice - input.purchasePrice
                        );
                    }
                }

                updateData.updatedAt = new Date().toISOString();

                //= Get data before update
                const dataBeforeUpdate = await db
                    .select({
                        id: product.id,
                        code: product.code,
                        name: product.name,
                        description: product.description,
                        originalPrice: product.purchasePrice,
                        sellingPrice: product.sellingPrice,
                        stock: product.availableStock,
                        unit: unit.name,
                        category: category.name,
                        status: product.status,
                    })
                    .from(product)
                    .leftJoin(unit, eq(product.unitId, unit.id))
                    .leftJoin(category, eq(product.categoryId, category.id))
                    .where(and(eq(product.id, input.id), eq(product.createdBy, userId)))
                    .execute();

                //= Update product
                await db
                    .update(product)
                    .set(updateData)
                    .where(and(eq(product.id, input.id)))
                    .execute();


                //= Get data after update
                const dataAfterUpdate = await db
                    .select({
                        id: product.id,
                        code: product.code,
                        name: product.name,
                        description: product.description,
                        originalPrice: product.purchasePrice,
                        sellingPrice: product.sellingPrice,
                        stock: product.availableStock,
                        unit: unit.name,
                        category: category.name,
                        status: product.status,
                    })
                    .from(product)
                    .leftJoin(unit, eq(product.unitId, unit.id))
                    .leftJoin(category, eq(product.categoryId, category.id))
                    .where(and(eq(product.id, input.id), eq(product.createdBy, userId)))
                    .execute();

                if (dataBeforeUpdate[0]?.stock !== dataAfterUpdate[0]?.stock) {
                    // Insert stock history
                    await db.insert(stockHistory).values({
                        product_id: input.id,
                        previous_stock: String(dataBeforeUpdate[0]?.stock ?? 0),
                        new_stock: String(dataAfterUpdate[0]?.stock ?? 0),
                        change_amount: String((dataAfterUpdate[0]?.stock ?? 0) - (dataBeforeUpdate[0]?.stock ?? 0)),
                        changed_by: userId,
                        change_reason: "NEW_STOCK",
                        change_note: "Initial stock on product creation",
                        status: "ACTIVE",
                    });


                    // store change log
                    await storeChangeLog({
                        action: 'update',
                        primaryAffectedEntity: 'Product',
                        primaryAffectedEntityID: String(input.id),
                        primaryOrSecAffectedTable: 'product',
                        primaryOrSecAffectedEntityID: String(input.id),
                        originalData: dataBeforeUpdate[0],
                        newData: dataAfterUpdate[0],
                        skipFields: ["id", "expectedProfit"],
                        session
                    })
                }

                return { success: true, message: "Product updated successfully" };
            } catch (e) {
                return {
                    success: false,
                    message: e instanceof Error ? e.message : "Failed to update product",
                };
            }
        }),

    listProducts: base
        .use(authMiddleware)
        .input(listProductsSchema)
        .handler(async ({ context: { db }, input }) => {
            try {
                const searchTerm = input.search?.trim();
                const filter = searchTerm
                    ? ilike(product.name, `%${searchTerm}%`)
                    : undefined;

                const [productsData, total] = await Promise.all([
                    db
                        .select({
                            id: product.id,
                            code: product.code,
                            name: product.name,
                            description: product.description,
                            originalPrice: product.purchasePrice,
                            sellingPrice: product.sellingPrice,
                            expectedProfit: product.expectedProfit,
                            stock: product.availableStock,
                            unit: { id: unit.id, name: unit.name, acronym: unit.acronym },
                            category: { id: category.id, name: category.name },
                            createdAt: product.createdAt,
                            updatedAt: product.updatedAt,
                            minimumStock: product.minimumStock,
                            status: product.status,
                        })
                        .from(product)
                        .leftJoin(unit, eq(product.unitId, unit.id))
                        .leftJoin(category, eq(product.categoryId, category.id))
                        .where(filter)
                        .orderBy(
                            input.sortOrder === "desc"
                                ? desc(product[input.sortBy])
                                : asc(product[input.sortBy])
                        )
                        .limit(input.pageSize || 10)
                        .offset(((input.page ?? 1) - 1) * (input.pageSize || 10)),

                    db
                        .select({ count: sql<number>`count(*)` })
                        .from(product)
                        .where(filter)
                        .then((res) => res[0]?.count || 0),
                ]);

                return { success: true, data: { products: productsData, total } };
            } catch (e) {
                return {
                    success: false,
                    message: e instanceof Error ? e.message : "Failed to fetch products",
                    data: { products: [], total: 0 },
                };
            }
        }),

    getProductById: base
        .use(authMiddleware)
        .input(readProductSchema.pick({ id: true }))
        .handler(async ({ context: { db }, input }) => {
            try {
                const productData = await db
                    .select()
                    .from(product)
                    .where(eq(product.id, input.id))
                    .then((res) => res[0]);

                if (!productData) {
                    return { success: false, message: "Product not found" };
                }

                return { success: true, data: productData };
            } catch (e) {
                return {
                    success: false,
                    message:
                        e instanceof Error ? e.message : "Failed to fetch product by ID",
                };
            }
        }),

    deleteProduct: base
        .use(authMiddleware)
        .input(deleteProductSchema)
        .handler(async ({ context: { db, session }, input }) => {
            try {
                const userId = session.user.id;

                await db
                    .delete(product)
                    .where(and(eq(product.id, input.id), eq(product.createdBy, userId)));


                //= store change log
                await storeChangeLog({
                    action: 'delete',
                    primaryAffectedEntity: 'Product',
                    primaryAffectedEntityID: String(input.id),
                    primaryOrSecAffectedTable: 'product',
                    primaryOrSecAffectedEntityID: String(input.id),
                    originalData: { id: input.id },
                    newData: {},
                    skipFields: ["id"],
                    session
                });

                return { success: true, message: "Product deleted successfully" };
            } catch (e) {
                return {
                    success: false,
                    message: e instanceof Error ? e.message : "Failed to delete product",
                };
            }
        }),

    getAllProducts: base
        .use(noAuthMiddleware).handler(async ({ context: { db } }) => {
            try {
                const productsData = await db
                    .select({ id: product.id, name: product.name })
                    .from(product)
                    .orderBy(product.name);

                return { success: true, data: { products: productsData } };
            } catch (e) {
                return {
                    success: false,
                    message: e instanceof Error ? e.message : "Failed to fetch products",
                    data: { products: [] },
                };
            }
        }),

    updateProductStock: base
        .use(authMiddleware)
        .input(updateStockSchema)
        .handler(async ({ context: { db, session }, input }) => {
            try {
                const userId = session.user.id;

                // 1. Check if product exists and belongs to the user
                const existingProduct = await db
                    .select()
                    .from(product)
                    .where(and(eq(product.id, input.id), eq(product.createdBy, userId)))
                    .then(res => res[0]);

                if (!existingProduct) {
                    return {
                        success: false,
                        message: "Product not found or you don't have permission to update it",
                    };
                }

                const previousStock = Number(existingProduct.availableStock);
                const newStock = Number(input.availableStock);
                const changeAmount = newStock - previousStock;


                if (newStock !== previousStock) {
                    // 2. Update product stock
                    await db
                        .update(product)
                        .set({
                            availableStock: newStock,
                            updatedAt: new Date().toISOString(),
                        })
                        .where(and(eq(product.id, input.id), eq(product.createdBy, userId)));

                    // 3. Insert stock history record
                    await db.insert(stockHistory).values({
                        product_id: input.id,
                        previous_stock: previousStock.toString(), // decimal → string
                        new_stock: newStock.toString(),
                        change_amount: changeAmount.toString(),
                        changed_by: userId,
                        change_reason: input.reason,
                        change_note: input.otherReason ?? null,
                        status: "ACTIVE",
                    });

                    //= store change log
                    await storeChangeLog({
                        action: 'update',
                        primaryAffectedEntity: 'Stock',
                        primaryAffectedEntityID: String(input.id),
                        primaryOrSecAffectedTable: 'product',
                        primaryOrSecAffectedEntityID: String(input.id),
                        originalData: { stock: previousStock },
                        newData: { stock: newStock },
                        skipFields: ["id"],
                        session
                    })
                }

                return {
                    success: true,
                    message: "Product stock updated successfully",
                };
            } catch (e) {
                return {
                    success: false,
                    message: e instanceof Error ? e.message : "Failed to update product stock",
                };
            }
        }),

    getProductsByIds: base
        .use(noAuthMiddleware)
        .input(productIds)
        .handler(async ({ context: { db }, input }) => {
            try {
                if (!input.ids || !Array.isArray(input.ids) || input.ids.length === 0) {
                    return {
                        success: false,
                        message: "No product IDs provided",
                        data: { products: [] },
                    };
                }

                const productsData = await db
                    .select({
                        id: product.id,
                        code: product.code,
                        name: product.name,
                        description: product.description,
                        originalPrice: product.purchasePrice,
                        sellingPrice: product.sellingPrice,
                        expectedProfit: product.expectedProfit,
                        stock: product.availableStock,
                        unit: { id: unit.id, name: unit.name, acronym: unit.acronym },
                        category: { id: category.id, name: category.name },
                        createdAt: product.createdAt,
                        updatedAt: product.updatedAt,
                        minimumStock: product.minimumStock,
                        status: product.status,
                    })
                    .from(product)
                    .leftJoin(unit, eq(product.unitId, unit.id))
                    .leftJoin(category, eq(product.categoryId, category.id))
                    .where(inArray(product.id, input.ids))
                    .orderBy(asc(product.name));

                return { success: true, data: { products: productsData } };
            } catch (e) {
                return {
                    success: false,
                    message: e instanceof Error ? e.message : "Failed to fetch cart products",
                    data: { products: [] },
                };
            }
        })
};
