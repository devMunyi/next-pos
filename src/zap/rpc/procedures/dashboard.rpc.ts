import "server-only";

import type { SQL } from "drizzle-orm";
import { and, between, eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";
import { z } from "zod";

import * as schema from "@/db/schema";
const { creditRepayment, expenses, invoice, product } = schema;
import { authMiddleware, base } from "@/rpc/middlewares";

const dashboardSummarySchema = z.object({
    from: z.string(), // ISO date string
    to: z.string(),
});

type DailyMetric = {
    date: string;
    value: number;
};

type DashboardSummaryResponse = {
    totalProducts: DailyMetric[];
    cashSales: DailyMetric[];
    creditSales: DailyMetric[];
    creditRepayments: DailyMetric[];
    expenses: DailyMetric[];
    profit: DailyMetric[];
    netProfit: DailyMetric[];
};

// Helper function to format date to YYYY-MM-DD hh:mm:ss
const formatDateToDBString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Helper function to get today's date range
const getTodayDateRange = (): { from: string; to: string } => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    return {
        from: formatDateToDBString(from),
        to: formatDateToDBString(to)
    };
};

// Helper function to get start and end of month
const getMonthDateRange = (): { from: string; to: string } => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return {
        from: formatDateToDBString(from),
        to: formatDateToDBString(to)
    };
};

// Type for database instance
type DbType = NodePgDatabase<typeof schema>;

// Helper function to get daily metrics
const getDailyMetrics = async (
    db: DbType,
    from: string,
    to: string,
    table: AnyPgTable,
    dateColumn: AnyPgColumn,
    valueExpr: SQL<number>,
    whereConditions?: SQL
): Promise<DailyMetric[]> => {
    // Generate all dates in the range
    const dateSeries = await db.execute(sql`
        SELECT generate_series(
            date_trunc('day', ${from}::timestamp),
            date_trunc('day', ${to}::timestamp),
            '1 day'::interval
        )::date as date
    `);

    interface DateSeriesRow {
        date: string;
    }

    const dates = (dateSeries.rows as unknown as DateSeriesRow[]).map((row) => {
        const date = new Date(row.date);
        return formatDateToDBString(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    });

    const combinedCondition = whereConditions
        ? and(whereConditions, between(dateColumn, from, to))
        : between(dateColumn, from, to);

    interface ResultRow {
        date: string;
        value: number;
    }

    const results = await db
        .select({
            date: sql<string>`DATE(${dateColumn})`,
            value: valueExpr,
        })
        .from(table)
        .where(combinedCondition)
        .groupBy(sql`DATE(${dateColumn})`) as ResultRow[];

    // Fill in missing dates with 0 values
    return dates.map((date) => {
        const formattedDate = date.split(' ')[0]; // Get just the date part
        const found = results.find((r) => {
            const resultDate = new Date(r.date);
            const resultFormatted = formatDateToDBString(
                new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate())
            ).split(' ')[0];
            return resultFormatted === formattedDate;
        });
        return {
            date: formattedDate,
            value: found ? Number(found.value) : 0,
        };
    });
};

// Helper function to get today's metrics (simplified version without date series)
const getTodayMetrics = async (
    db: DbType,
    table: AnyPgTable,
    dateColumn: AnyPgColumn,
    valueExpr: SQL<number>,
    whereConditions?: SQL
): Promise<DailyMetric[]> => {
    const todayRange = getTodayDateRange();
    const { from, to } = todayRange;

    const combinedCondition = whereConditions
        ? and(whereConditions, between(dateColumn, from, to))
        : between(dateColumn, from, to);

    interface ResultRow {
        value: number;
    }

    const results = await db
        .select({
            value: valueExpr,
        })
        .from(table)
        .where(combinedCondition) as ResultRow[];

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    return [{
        date: today,
        value: results[0] ? Number(results[0].value) : 0,
    }];
};

export const dashboard = {
    getSummary: base
        .use(authMiddleware)
        .input(dashboardSummarySchema)
        .handler(async ({ context: { db }, input }) => {
            // Use provided dates or default to current month
            const { from, to } = input.from && input.to
                ? { from: input.from, to: input.to }
                : getMonthDateRange();

            try {
                // Get daily metrics for each category
                const [
                    totalProducts,
                    cashSales,
                    creditSales,
                    creditRepayments,
                    expensesData,
                    profitData,
                ] = await Promise.all([
                    // Total Products per day
                    getDailyMetrics(
                        db,
                        from,
                        to,
                        product,
                        product.createdAt,
                        sql<number>`COUNT(*)`
                    ),
                    // Cash Sales per day
                    getDailyMetrics(
                        db,
                        from,
                        to,
                        invoice,
                        invoice.createdAt,
                        sql<number>`COALESCE(SUM(${invoice.totalAmount}), 0)`,
                        eq(invoice.saleType, "CASH")
                    ),
                    // Credit Sales per day
                    getDailyMetrics(
                        db,
                        from,
                        to,
                        invoice,
                        invoice.createdAt,
                        sql<number>`COALESCE(SUM(${invoice.totalAmount}), 0)`,
                        eq(invoice.saleType, "CREDIT")
                    ),
                    // Credit Repayments per day
                    getDailyMetrics(
                        db,
                        from,
                        to,
                        creditRepayment,
                        creditRepayment.paymentDate,
                        sql<number>`COALESCE(SUM(${creditRepayment.amountPaid}), 0)`
                    ),
                    // Expenses per day
                    getDailyMetrics(
                        db,
                        from,
                        to,
                        expenses,
                        expenses.expenseDate,
                        sql<number>`COALESCE(SUM(${expenses.amount}), 0)`
                    ),
                    // Profit per day
                    getDailyMetrics(
                        db,
                        from,
                        to,
                        invoice,
                        invoice.createdAt,
                        sql<number>`COALESCE(SUM(${invoice.saleProfit}), 0)`
                    ),
                ]);

                // Calculate Net Profit per day (Profit - Expenses)
                const netProfit = totalProducts.map((_, index) => {
                    const date = totalProducts[index].date;
                    const profitForDate = profitData.find(p => p.date === date)?.value || 0;
                    const expensesForDate = expensesData.find(e => e.date === date)?.value || 0;
                    return {
                        date,
                        value: profitForDate - expensesForDate,
                    };
                });

                return {
                    totalProducts,
                    cashSales,
                    creditSales,
                    creditRepayments,
                    expenses: expensesData,
                    profit: profitData,
                    netProfit,
                };
            } catch (e) {
                console.error("Error fetching dashboard summary:", e);
                throw new Error("Failed to get summary");
            }
        }),

    getTodaySummary: base
        .use(authMiddleware)
        .handler(async ({ context: { db } }): Promise<DashboardSummaryResponse> => {
            try {
                // Get today's metrics for each category
                const [
                    totalProducts,
                    cashSales,
                    creditSales,
                    creditRepayments,
                    expensesData,
                    profitData,
                ] = await Promise.all([
                    // Total Products today
                    getTodayMetrics(
                        db,
                        product,
                        product.createdAt,
                        sql<number>`COUNT(*)`
                    ),
                    // Cash Sales today
                    getTodayMetrics(
                        db,
                        invoice,
                        invoice.createdAt,
                        sql<number>`COALESCE(SUM(${invoice.totalAmount}), 0)`,
                        eq(invoice.saleType, "CASH")
                    ),
                    // Credit Sales today
                    getTodayMetrics(
                        db,
                        invoice,
                        invoice.createdAt,
                        sql<number>`COALESCE(SUM(${invoice.totalAmount}), 0)`,
                        eq(invoice.saleType, "CREDIT")
                    ),
                    // Credit Repayments today
                    getTodayMetrics(
                        db,
                        creditRepayment,
                        creditRepayment.paymentDate,
                        sql<number>`COALESCE(SUM(${creditRepayment.amountPaid}), 0)`
                    ),
                    // Expenses today
                    getTodayMetrics(
                        db,
                        expenses,
                        expenses.expenseDate,
                        sql<number>`COALESCE(SUM(${expenses.amount}), 0)`
                    ),
                    // Profit today
                    getTodayMetrics(
                        db,
                        invoice,
                        invoice.createdAt,
                        sql<number>`COALESCE(SUM(${invoice.saleProfit}), 0)`
                    ),
                ]);

                // Calculate Net Profit for today (Profit - Expenses)
                const netProfit = [{
                    date: totalProducts[0].date,
                    value: (profitData[0]?.value || 0) - (expensesData[0]?.value || 0),
                }];

                return {
                    totalProducts,
                    cashSales,
                    creditSales,
                    creditRepayments,
                    expenses: expensesData,
                    profit: profitData,
                    netProfit,
                };
            } catch (e) {
                console.error("Error fetching today's summary:", e);
                throw new Error("Failed to get today's summary");
            }
        }),
};