// src/zap/hooks/category/use-product.tsx
"use client";
import "client-only";

import { useState } from "react";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import { client } from "@/zap/lib/orpc/client";
import { getErrorMessage } from "@/zap/lib/util/common.util";
import { DEFAULT_PAGE_SIZE } from "@/zap/lib/util/constants";
import { CreateProductInput } from "@/zap/schemas/product.schema";
import { Product } from "@/zap/types/infer-rpc";

import { useDebounce } from "../use-debounce";

export function useProduct() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Get all products with pagination
    const { data: products, mutate: refreshProducts } = useSWR(
        ["products", pagination.page, pagination.pageSize, debouncedSearchTerm],
        async ([, page, pageSize, search]) => {
            try {
                const result = await client.products.listProducts({
                    page,
                    pageSize,
                    search,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                });

                if (!result.success) {
                    toast.error(result.message || "Failed to fetch products");
                    return { products: [], total: 0 };
                }

                return result.data;
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Failed to fetch products");
                return { products: [], total: 0 };
            }
        }
    );

    // Get single product
    const { data: currentProduct } = useSWR(
        selectedProduct ? `product-${selectedProduct.id}` : null,
        async () => {
            try {
                const result = await client.products.getProductById({
                    id: String(selectedProduct?.id),
                });

                if (!result.success) {
                    toast.error(result.message || "Failed to fetch product details");
                    return null;
                }

                return result.data;
            } catch (error) {
                console.error("Error fetching product by ID:", error);
                toast.error("Failed to fetch product details");
                return null;
            }
        }
    );

    // Add product
    const { trigger: addProduct, isMutating: isAdding } = useSWRMutation(
        "add-product",
        async (_key, { arg }: { arg: CreateProductInput }) => {
            try {
                const result = await client.products.createProduct(arg);

                if (result.success) {
                    toast.success(result.message || "Product added successfully");

                    await refreshProducts();
                    await mutate("all-products");

                    return true;
                } else {
                    toast.error(result.message || "Failed to add product");
                    return false;
                }
            } catch (error) {
                console.error("Error adding product:", error);
                toast.error("Failed to add product");
                return false;
            }
        }
    );

    // Update product
    const { trigger: updateProduct, isMutating: isUpdating } = useSWRMutation(
        "update-product",
        async (_key, { arg }: { arg: { id: string; data: CreateProductInput } }) => {
            try {
                const result = await client.products.updateProduct({
                    id: arg.id,
                    ...arg.data,
                });

                if (result.success) {
                    toast.success(result.message || "Product updated successfully");
                    await refreshProducts();
                    setSelectedProduct(null);
                    return true;
                } else {
                    toast.error(result.message || "Failed to update product");
                    return false;
                }
            } catch (error) {
                console.error("Error updating product:", error);
                toast.error("Failed to update product");
                return false;
            }
        }
    );

    // Delete product
    const { trigger: deleteProduct, isMutating: isDeleting } = useSWRMutation(
        "delete-product",
        async (_key, { arg }: { arg: { id: string } }) => {
            try {
                const result = await client.products.deleteProduct({ id: arg.id });

                if (result.success) {
                    toast.success(result.message || "Product deleted successfully");
                    await refreshProducts();
                    return true;
                } else {
                    toast.error(result.message || "Failed to delete product");
                    return false;
                }
            } catch (error) {
                console.error("Error deleting product:", error);
                toast.error("Failed to delete product");
                return false;
            }
        }
    );

    // All products
    const { data: allProducts } = useSWR("all-products", async () => {
        try {
            const result = await client.products.getAllProducts();

            if (!result.success) {
                toast.error(result.message || "Failed to fetch all products");
                return { products: [] };
            }

            return result.data;
        } catch (error) {
            console.error("Error fetching all products:", error);
            toast.error("Failed to fetch all products");
            return { products: [] };
        }
    });

    // Update product stock
    const { trigger: updateStock, isMutating: isUpdatingStock } = useSWRMutation(
        "update-stock",
        async (_key, { arg }: { arg: { id: string; availableStock: number } }) => {
            try {
                const result = await client.products.updateProductStock({
                    id: arg.id,
                    availableStock: arg.availableStock,
                });

                if (result.success) {
                    toast.success(result.message || "Product stock updated successfully");
                    await refreshProducts();
                    await mutate("all-products");
                    return true;
                } else {
                    toast.error(result.message || "Failed to update product stock");
                    return false;
                }
            } catch (error) {
                const message = getErrorMessage(error, "Failed to update product stock");
                toast.error(message);
                return false;
            }
        }
    );

    const setPage = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const setPageSize = (pageSize: number) => {
        setPagination((prev) => ({ ...prev, pageSize, page: 0 }));
    };

    return {
        // State
        products: products?.products ?? [],
        allProducts: allProducts?.products ?? [],
        currentProduct,
        selectedProduct,
        setSelectedProduct,
        pagination,
        setPage,
        setPageSize,
        totalCount: products?.total ?? 0,

        // Actions
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,

        // Loading states
        isLoading: !products,
        allLoading: !allProducts,
        isAdding,
        isUpdating,
        isDeleting,

        // Search
        searchTerm,
        setSearchTerm,

        // Stock
        updateStock,
        isUpdatingStock
    };
}
