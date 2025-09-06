// src/zap/rpc/procedures/unit.rpc.ts
import "server-only";

import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import { Effect } from "effect";

import { unit } from "@/db/schema";
import { authMiddleware, base, noAuthMiddleware } from "@/rpc/middlewares";
import { createUnitSchema, deleteUnitSchema, listUnitsSchema, readUnitSchema, updateUnitSchema } from "@/zap/schemas/unit.schema";
import { getStringDate } from "@/zap/lib/util/date.util";


export const units = {

    // Create unit procedure
    createUnit: base
        .use(authMiddleware)
        .input(createUnitSchema)
        .handler(async ({ context: { session, db }, input }): Promise<{ success: boolean }> => {
            const effect = Effect.gen(function* (_) {
                const userId = session.user.id;

                yield* _(
                    Effect.tryPromise({
                        try: () =>
                            db
                                .insert(unit)
                                .values({
                                    createdBy: userId,
                                    createdAt: getStringDate(),
                                    ...input,
                                })
                                .execute(),
                        catch: (e) => {
                            return new Error(
                                e instanceof Error
                                    ? e.message
                                    : "Failed to create unit"
                            );
                        },
                    }),
                );

                return { success: true };
            });

            return await Effect.runPromise(effect);
        }),

    // Update unit procedure
    updateUnit: base
        .use(authMiddleware)
        .input(updateUnitSchema)
        .handler(async ({ context: { db }, input }) => {
            const effect = Effect.gen(function* (_) {
                // const userId = session.user.id;

                yield* _(
                    Effect.tryPromise({
                        try: () =>
                            db
                                .update(unit)
                                .set({
                                    ...input,
                                    updatedAt: getStringDate(),
                                })
                                .where(eq(unit.id, input.id!))
                                .execute(),
                        catch: (e) => {
                            return new Error(
                                e instanceof Error
                                    ? e.message
                                    : "Failed to update unit"
                            );
                        },
                    }),
                );

                return { success: true };
            });

            return await Effect.runPromise(effect);
        }),

    // List units procedure
    listUnits: base
        .use(authMiddleware)
        .input(listUnitsSchema)
        .handler(async ({ context: { db }, input }) => {
            const effect = Effect.gen(function* (_) {
                const searchTerm = input.search?.trim();

                // Dynamic WHERE clause (removed createdBy filter)
                const filter = searchTerm
                    ? ilike(unit.name, `%${searchTerm}%`)
                    : undefined;

                // Execute both queries in parallel
                const [units, total] = yield* _(
                    Effect.tryPromise({
                        try: () => Promise.all([
                            // Main data query
                            db
                                .select()
                                .from(unit)
                                .where(filter)
                                .orderBy(
                                    input.sortOrder === 'desc'
                                        ? desc(unit[input.sortBy])
                                        : asc(unit[input.sortBy])
                                )
                                .limit(input.pageSize || 10)
                                .offset(((input.page ?? 1) - 1) * (input.pageSize || 10))
                                .execute(),

                            // Count query
                            db
                                .select({ count: sql<number>`count(*)` })
                                .from(unit)
                                .where(filter)
                                .then((res) => res[0]?.count || 0)
                        ]),
                        catch: (e) => new Error(
                            e instanceof Error
                                ? e.message
                                : "Failed to get units"
                        ),
                    })
                );

                return {
                    units,
                    total
                };
            });

            return await Effect.runPromise(effect);
        }),

    // Delete unit procedure 
    deleteUnit: base
        .use(authMiddleware)
        .input(deleteUnitSchema)
        .handler(async ({ context: { db, session }, input }) => {
            const effect = Effect.gen(function* (_) {
                const userId = session.user.id;

                yield* _(
                    Effect.tryPromise({
                        try: () =>
                            db
                                .delete(unit)
                                .where(
                                    and(
                                        eq(unit.id, input.id),
                                        eq(unit.createdBy, userId)
                                    )
                                )
                                .execute(),
                        catch: (e) => new Error(
                            e instanceof Error
                                ? e.message
                                : "Failed to delete unit"
                        ),
                    }),
                );

                return { success: true };
            });

            return await Effect.runPromise(effect);
        }),

    // Get unit by ID procedure
    getUnitById: base
        .use(authMiddleware)
        .input(readUnitSchema)
        .handler(async ({ context: { db }, input }) => {
            const effect = Effect.gen(function* (_) {
                // const userId = session.user.id;

                const unitData = yield* _(
                    Effect.tryPromise({
                        try: () =>
                            db
                                .select()
                                .from(unit)
                                .where(
                                    eq(unit.id, input.id),
                                )
                                .execute()
                                .then((res) => res[0]),
                        catch: (e) => new Error(
                            e instanceof Error
                                ? e.message
                                : "Failed to get unit by ID"
                        ),
                    }),
                );

                if (!unitData) {
                    throw new Error("Unit not found");
                }

                return unitData;
            });

            return await Effect.runPromise(effect);
        }),


    // get all units procedure
    getAllUnits: base
        .use(noAuthMiddleware)
        .handler(async ({ context: { db } }) => {
            const effect = Effect.gen(function* (_) {
                const units: { id: string; name: string }[] = yield* _(
                    Effect.tryPromise({
                        try: () =>
                            db
                                .select(
                                    {
                                        id: unit.id,
                                        name: unit.name
                                    }
                                )
                                .from(unit)
                                .orderBy(unit.name)
                                .execute(),
                        catch: (e) => new Error(
                            e instanceof Error
                                ? e.message
                                : "Failed to get categories"
                        ),
                    }),
                );

                return { units };
            });

            return await Effect.runPromise(effect);
        })
};
