// src/app/(protected)/app/products/page.tsx
"use client";
import React, { useCallback, useEffect, useState } from 'react';

import { useOrders } from '@/zap/hooks/orders/use-orders';

import { Pagination } from '../../../../components/pagination';
import { OrdersTable } from './orders-table';
import { OrdersToolbar } from './orders-toolbar';

export default function OrdersPage() {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const {
        orders,
        deleteOrder,
        pagination,
        setPage,
        setPageSize,
        totalCount,
        isLoading,
        isDeleting,
        searchTerm,
        setSearchTerm,
        refreshOrders,
    } = useOrders();

    // Handle search with debounce
    useEffect(() => {
        refreshOrders();
    }, [searchTerm, pagination.page, pagination.pageSize, refreshOrders]);

    const handleDelete = useCallback(async (id: string) => {
        setDeletingId(id); // Set the ID of the order being deleted
        try {
            await deleteOrder({ id });
        } finally {
            setDeletingId(null); // Reset after delete completes (success or failure)
        }
    }, [deleteOrder]);

    // const handleView = useCallback((order: Order) => {
    //     setSelectedOrder(order);
    // }, [setSelectedOrder]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        setPage(1); // Reset to first page when searching
    }, [setSearchTerm, setPage]);


    return (
        <div className="">
            <OrdersToolbar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onAddClick={() => {
                    console.log("Add Order Clicked");
                }}
                currentPage={pagination.page}
                pageSize={pagination.pageSize}
                totalCount={totalCount}
                isLoading={isLoading}
            />

            <div className="rounded-md border">
                <OrdersTable
                    orders={Array.isArray(orders) ? orders : orders ?? []}
                    isLoading={isLoading}
                    isDeleting={isDeleting}
                    onPrint={() => console.log("Print Order")}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                    // onView={handleView}
                    rpp={pagination.pageSize}
                />
            </div>

            {/* Pagination */}
            <Pagination
                page={pagination.page}
                pageSize={pagination.pageSize}
                totalCount={totalCount}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                isLoading={isLoading}
            />
        </div>
    );
}