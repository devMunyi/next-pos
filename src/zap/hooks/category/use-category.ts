// src/zap/hooks/category/use-categories.tsx
"use client";
import "client-only";

import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { client } from "@/zap/lib/orpc/client";
import { getErrorMessage } from "@/zap/lib/util/common.client.util";
import { DEFAULT_PAGE_SIZE } from "@/zap/lib/util/constants";
import {
    CreateCategoryInput,
    ReadCategoryInput,
} from "@/zap/schemas/category.schema";

import { useDebounce } from "../use-debounce";

export function useCategory() {
    const [selectedCategory, setSelectedCategory] =
        useState<ReadCategoryInput | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Get categories with pagination
    const { data: categories, mutate: refreshCategories } = useSWR(
        ["categories", pagination.page, pagination.pageSize, debouncedSearchTerm],
        async ([, page, pageSize, search]) => {
            try {
                return await client.categories.listCategories({
                    page,
                    pageSize,
                    search: search || undefined,
                });
            } catch (e) {
                const message = getErrorMessage(e, "Failed to fetch categories");
                toast.error(message);
                return { categories: [], total: 0, page, pageSize, totalPages: 0 };
            }
        }
    );

    // Get single category
    const { data: currentCategory } = useSWR(
        selectedCategory ? `category-${selectedCategory.id}` : null,
        async () => {
            try {
                return await client.categories.getCategoryById({
                    id: selectedCategory!.id,
                });
            } catch (e) {
                const message = getErrorMessage(e, "Failed to fetch category");
                toast.error(message);
                return { category: null };
            }
        }
    );

    // Add category
    const { trigger: addCategory, isMutating: isAdding } = useSWRMutation(
        "add-category",
        async (_key, { arg }: { arg: CreateCategoryInput }) => {
            try {
                const result = await client.categories.addCategory(arg);
                if (result.success) {
                    await refreshCategories();
                    toast.success("Category added successfully");
                } else {
                    toast.error(result.message ?? "Failed to add category");
                }
                return result;
            } catch (e) {
                const message = getErrorMessage(e);
                toast.error(`Failed to add category: ${message}`);
                return { success: false };
            }
        }
    );

    // Update category
    const { trigger: updateCategory, isMutating: isUpdating } = useSWRMutation(
        "update-category",
        async (_key, { arg }: { arg: { id: string; data: CreateCategoryInput } }) => {
            try {
                const result = await client.categories.updateCategory({
                    id: arg.id,
                    ...arg.data,
                });
                if (result.success) {

                    await refreshCategories();
                    setSelectedCategory(null);
                    toast.success("Category updated successfully");
                } else {
                    toast.error(result.message ?? "Failed to update category");
                }
                return result;
            } catch (e) {
                const message = getErrorMessage(e, "Failed to update category");
                toast.error(message);
                return { success: false };
            }
        }
    );

    // Delete category
    const { trigger: deleteCategory, isMutating: isDeleting } = useSWRMutation(
        "delete-category",
        async (_key, { arg }: { arg: { id: string } }) => {
            try {
                const result = await client.categories.deleteCategory({ id: arg.id });
                if (result.success) {
                    await refreshCategories();
                    toast.success("Category deleted successfully");
                } else {
                    toast.error(result.message ?? "Failed to delete category");
                }
                return result;
            } catch (e) {
                const message = getErrorMessage(e, "Failed to delete category");
                toast.error(message);
                return { success: false };
            }
        }
    );

    // Get all categories (no pagination)
    const { data: allCategories } = useSWR("all-categories", async () => {
        try {
            return await client.categories.getAllCategories();
        } catch (e) {
            const message = getErrorMessage(e, "Failed to fetch categories");
            toast.error(message);
            return { categories: [] };
        }
    });

    const setPage = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const setPageSize = (pageSize: number) => {
        setPagination((prev) => ({ ...prev, pageSize, page: 0 }));
    };

    return {
        // State
        categories: categories?.categories ?? [],
        allCategories: allCategories?.categories ?? [],
        currentCategory,
        selectedCategory,
        setSelectedCategory,
        pagination,
        setPage,
        setPageSize,
        totalCount: categories?.total ?? 0,

        // Actions
        addCategory,
        updateCategory,
        deleteCategory,
        refreshCategories,

        // Loading states
        isLoading: !categories,
        allLoading: !allCategories,
        isAdding,
        isUpdating,
        isDeleting,

        // Search
        searchTerm,
        setSearchTerm,
    };
}
