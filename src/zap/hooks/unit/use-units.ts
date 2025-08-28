// src/zap/hooks/category/use-unit.tsx
"use client";
import "client-only";

import { Effect } from "effect";
import { useState } from "react";
import toast from 'react-hot-toast';
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { Unit } from "@/db/schema";
import { client } from "@/zap/lib/orpc/client";
import { DEFAULT_PAGE_SIZE } from "@/zap/lib/util/constants";
import { CreateUnitInput } from "@/zap/schemas/unit.schema";

import { useDebounce } from "../use-debounce";

export function useUnit() {
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE
    });
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Get all units with pagination
    // In your useUnit hook, modify the useSWR call:
    const { data: units, mutate: refreshUnits } = useSWR(
        ['units', pagination.page, pagination.pageSize, debouncedSearchTerm],
        async ([, page, pageSize, search]) => {
            const effect = Effect.gen(function* () {
                const result = yield* Effect.tryPromise(() =>
                    client.units.listUnits({
                        page,
                        pageSize,
                        search
                    })
                );
                return result;
            });
            return await Effect.runPromise(effect);
        }
    );

    // Get single unit
    const { data: currentUnit } = useSWR(
        selectedUnit ? `unit-${selectedUnit.id}` : null,
        async () => {
            const effect = Effect.gen(function* () {
                const result = yield* Effect.tryPromise(() =>
                    client.units.getUnitById(selectedUnit!)
                );
                return result;
            });
            return await Effect.runPromise(effect);
        }
    );

    // Add unit
    const { trigger: addUnit, isMutating: isAdding } = useSWRMutation(
        "add-unit",
        async (_key, { arg }: { arg: CreateUnitInput }) => {

            const effect = Effect.gen(function* () {
                const result = yield* Effect.tryPromise(() =>
                    client.units.createUnit(arg)
                );

                if (result.success) {
                    yield* Effect.sync(() => refreshUnits());
                    toast.success("Unit added successfully");
                }
                return result;
            });
            return await Effect.runPromise(effect);
        }
    );

    // Update unit
    const { trigger: updateUnit, isMutating: isUpdating } = useSWRMutation(
        "update-unit",
        async (_key, { arg }: { arg: { id: string; data: CreateUnitInput } }) => {
            const effect = Effect.gen(function* () {
                const result = yield* Effect.tryPromise(() => client.units.updateUnit({ id: arg.id, ...arg.data }));
                if (result.success) {

                    yield* Effect.sync(() => {
                        refreshUnits();
                        setSelectedUnit(null);
                    });

                    toast.success("Unit updated successfully");
                }
                return result;
            });
            return await Effect.runPromise(effect);
        }
    );

    // Delete unit
    const { trigger: deleteUnit, isMutating: isDeleting } = useSWRMutation(
        "delete-unit",
        async (_key, { arg }: { arg: { id: string } }) => {
            const effect = Effect.gen(function* () {
                const result = yield* Effect.tryPromise(() =>
                    client.units.deleteUnit({ id: arg.id })
                );

                if (result.success) {

                    yield* Effect.sync(() => refreshUnits());

                    toast.success("Unit deleted successfully");
                }
                return result;
            });
            return await Effect.runPromise(effect);
        }
    );


    // All units
    const { data: allUnits } = useSWR(
        'all-units',
        async () => {
            const effect = Effect.gen(function* () {
                const result = yield* Effect.tryPromise(() =>
                    client.units.getAllUnits()
                );
                return result;
            });
            return await Effect.runPromise(effect);
        }
    );

    const setPage = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const setPageSize = (pageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize, page: 0 })); // Reset to first page when changing page size
    };

    return {
        // State
        units: units?.units ?? [],
        allUnits: allUnits?.units ?? [],
        currentUnit,
        selectedUnit,
        setSelectedUnit,
        pagination,
        setPage,
        setPageSize,
        totalCount: units?.total ?? 0,

        // Actions
        addUnit,
        updateUnit,
        deleteUnit,
        refreshUnits,

        // Loading states
        isLoading: !units,
        allLoading: !allUnits,
        isAdding,
        isUpdating,
        isDeleting,

        // Search
        searchTerm,
        setSearchTerm,
    };
}


