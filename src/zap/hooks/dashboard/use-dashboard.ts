"use client";
import "client-only";

import toast from "react-hot-toast";
import useSWR from "swr";

import { client } from "@/zap/lib/orpc/client";
import { getErrorMessage } from "@/zap/lib/util/common.client.util";
import { DashboardSummaryResponse } from "@/zap/types/infer-rpc";

// Default empty response
const emptyResponse: DashboardSummaryResponse = {
    totalProducts: [],
    cashSales: [],
    creditSales: [],
    creditRepayments: [],
    expenses: [],
    profit: [],
    netProfit: [],
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
            } catch (e) {
                toast.error(getErrorMessage(e, "Failed to fetch summary"));
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
            } catch (e) {
                toast.error(getErrorMessage(e, "Failed to fetch today's summary"));
                return emptyResponse;
            }
        },
        {
            // Refresh today's data more frequently (every 5 minutes)
            refreshInterval: 300000,
        }
    );

    return {
        summary: data || emptyResponse,
        todaySummary: todayData || emptyResponse,
        isLoading,
        isTodayLoading,
        refreshSummary: mutate,
    };
}