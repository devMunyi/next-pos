"use client";
import "client-only";

import useSWR from "swr";

import { client } from "@/zap/lib/orpc/client";
import { DashboardSummaryResponse, ProductStockHistory, TodayLowProductCountMetrics } from "@/zap/types/infer-rpc";

// Default empty response
const emptyResponse: DashboardSummaryResponse = {
    cashSales: [],
    creditSales: [],
    creditRepayments: [],
    expenses: [],
    profit: [],
    netProfit: [],
    totalProducts: []
};

export function useDashboard(from?: string, to?: string) {
    // Historical data for the selected date range
    const { data, mutate, isLoading } = useSWR<DashboardSummaryResponse>(
        from && to ? ["dashboard-summary", from, to] : null,
        async ([, fromDate, toDate]) => {
            try {
                return await client.dashboard.getSummary({
                    from: fromDate as string,
                    to: toDate as string,
                });
            } catch {
                return emptyResponse;
            }
        }
    );

    // Today's data
    const { data: todayData, isLoading: isTodayLoading } = useSWR<DashboardSummaryResponse>(
        ["dashboard-today"],
        async () => {
            try {
                return await client.dashboard.getTodaySummary();
            } catch {
                return emptyResponse;
            }
        },
        {
            refreshInterval: 300000,
        }
    );

    // Product stock history
    const { data: productStockHistory, isLoading: isProductStockHistoryLoading } = useSWR<ProductStockHistory[]>(
        from && to ? ["product-stock-history", from, to] : null,
        async ([, fromDate, toDate]) => {
            try {
                return await client.dashboard.getProductStockHistory({
                    from: fromDate as string,
                    to: toDate as string,
                });
            } catch {
                return [];
            }
        }
    );

    // Today's product low stock count
    const { data: todayProductLowStockCount, isLoading: isTodayProductLowStockCountLoading } =
        useSWR<TodayLowProductCountMetrics>(
            ["today-product-low-stock-count"],
            async () => {
                try {
                    return await client.dashboard.getTodayLowProductCountMetrics();
                } catch {
                    // Return the same structure as the success case
                    return { lowStockProductCount: 0 };
                }
            }
        );

    return {
        summary: data || emptyResponse,
        todaySummary: todayData || emptyResponse,
        productStockHistory: productStockHistory || [],
        todayProductLowStockCount: todayProductLowStockCount || [],
        isLoading,
        isTodayLoading,
        isProductStockHistoryLoading,
        isTodayProductLowStockCountLoading,
        refreshSummary: mutate,
    };
}