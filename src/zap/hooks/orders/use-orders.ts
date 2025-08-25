// src/zap/hooks/transaction/use-transaction.tsx
"use client";
import "client-only";

import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { client } from "@/zap/lib/orpc/client";
import { DEFAULT_PAGE_SIZE } from "@/zap/lib/util/constants";
import { CreateOrderInput } from "@/zap/schemas/orders.schema";
import { Order } from "@/zap/types/infer-rpc";

import { useDebounce } from "../use-debounce";

export function useOrders() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Get all orders with pagination
    const { data: orders, mutate: refreshOrders } = useSWR(
        ["orders", pagination.page, pagination.pageSize, debouncedSearchTerm],
        async ([, page, pageSize, search]) => {
            try {
                return await client.orders.listOrders({
                    page,
                    pageSize,
                    search,
                });
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error("Failed to fetch orders");
                return { orders: [], total: 0 };
            }
        }
    );

    // Get single order
    const { data: currentOrder } = useSWR(
        selectedOrder ? `order-${selectedOrder.id}` : null,
        async () => {
            try {
                return await client.orders.getOrderById({
                    id: String(selectedOrder?.id),
                });
            } catch (error) {
                console.error("Error fetching order by ID:", error);
                toast.error("Failed to fetch order details");
                return null;
            }
        }
    );

    // Add order
    const { trigger: createOrder, isMutating: isCreating } = useSWRMutation(
        "create-order",
        async (_key, { arg }: { arg: CreateOrderInput }) => {
            try {
                const result = await client.orders.createOrder(arg);
                if (result.success) {
                    toast.success(result.message || "Order created successfully");
                    return result.success;
                } else {
                    toast.error(result.message || "Failed to create order");
                    return null;
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "An unexpected error occurred";
                toast.error(`Failed to create order: ${errorMessage}`);
                return null;
            }
        }
    );

    // Delete order
    const { trigger: deleteOrder, isMutating: isDeleting } = useSWRMutation(
        "delete-order",
        async (_key, { arg }: { arg: { id: string } }) => {
            try {
                const result = await client.orders.deleteOrder({ id: arg.id });

                if (result.success) {
                    toast.success("Order deleted successfully");
                    await refreshOrders();
                    return result;
                } else {
                    toast.error("Failed to delete order");
                    return null;
                }
            } catch (error) {
                console.error("Error deleting order:", error);
                const errorMessage =
                    error instanceof Error ? error.message : "An unexpected error occurred";
                toast.error(`Failed to delete order: ${errorMessage}`);
                return null;
            }
        }
    );

    const setPage = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const setPageSize = (pageSize: number) => {
        // Reset to first page when changing page size
        setPagination((prev) => ({ ...prev, pageSize, page: 0 }));
    };

    return {
        // State
        orders: orders?.orders ?? [],
        currentOrder,
        selectedOrder,
        setSelectedOrder,
        pagination,
        setPage,
        setPageSize,
        totalCount: orders?.total ?? 0,

        // Actions
        createOrder,
        deleteOrder,
        refreshOrders,

        // Loading states
        isLoading: !orders,
        isCreating,
        isDeleting,

        // Search
        searchTerm,
        setSearchTerm,
    };
}
