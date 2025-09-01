import "server-only";

import type { SQL } from "drizzle-orm";
import { and, between, desc, eq, lte, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";
import { z } from "zod";

import * as schema from "@/db/schema";
const { creditRepayment, expenses, invoice, product, stockHistory } = schema;
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
const getDailyMetricsHelper = async (
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
            date: sql<string>`${dateColumn}`,
            value: valueExpr,
        })
        .from(table)
        .where(combinedCondition)
        .groupBy(sql`${dateColumn}`) as ResultRow[];

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
const getTodayMetricsHelper = async (
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

// 1) getDailyProductMetrics - Count of products created per day
const getDailyProductMetrics = async (db: DbType, from: string, to: string): Promise<DailyMetric[]> => {
    return getDailyMetricsHelper(
        db,
        from,
        to,
        product,
        product.createdAt,
        sql<number>`COUNT(*)`
    );
};

// 2) getDailyCashSaleMetrics
const getDailyCashSaleMetrics = async (db: DbType, from: string, to: string): Promise<DailyMetric[]> => {
    return getDailyMetricsHelper(
        db,
        from,
        to,
        invoice,
        invoice.createdAt,
        sql<number>`COALESCE(SUM(${invoice.totalAmount}), 0)`,
        eq(invoice.saleType, "CASH")
    );
};

// 3) getDailyCreditSaleMetrics
const getDailyCreditSaleMetrics = async (db: DbType, from: string, to: string): Promise<DailyMetric[]> => {
    return getDailyMetricsHelper(
        db,
        from,
        to,
        invoice,
        invoice.createdAt,
        sql<number>`COALESCE(SUM(${invoice.totalAmount}), 0)`,
        eq(invoice.saleType, "CREDIT")
    );
};

// 4) getDailyCreditRepaymentsMetrics
const getDailyCreditRepaymentsMetrics = async (db: DbType, from: string, to: string): Promise<DailyMetric[]> => {
    return getDailyMetricsHelper(
        db,
        from,
        to,
        creditRepayment,
        creditRepayment.paymentDate,
        sql<number>`COALESCE(SUM(${creditRepayment.amountPaid}), 0)`
    );
};

// 5) getDailyExpensesMetrics
const getDailyExpensesMetrics = async (db: DbType, from: string, to: string): Promise<DailyMetric[]> => {
    return getDailyMetricsHelper(
        db,
        from,
        to,
        expenses,
        expenses.expenseDate,
        sql<number>`COALESCE(SUM(${expenses.amount}), 0)`
    );
};

// 6) getDailyProfitMetrics
const getDailyProfitMetrics = async (db: DbType, from: string, to: string): Promise<DailyMetric[]> => {
    return getDailyMetricsHelper(
        db,
        from,
        to,
        invoice,
        invoice.createdAt,
        sql<number>`COALESCE(SUM(${invoice.saleProfit}), 0)`
    );
};

// New function to get product stock history
const getDailyProductStockHistory = async (
    db: DbType,
    from: string,
    to: string
) => {
    // First, get all stock history records within the date range
    const stockHistoryData = await db
        .select({
            productName: product.name,
            productId: product.id,
            date: stockHistory.change_date,
            previousStock: stockHistory.previous_stock,
            newStock: stockHistory.new_stock,
            changeAmount: stockHistory.change_amount,
            changedBy: schema.user.name,
            changeReason: stockHistory.change_reason,
            changeNote: stockHistory.change_note,
        })
        .from(stockHistory)
        .innerJoin(product, eq(stockHistory.product_id, product.id))
        .leftJoin(schema.user, eq(stockHistory.changed_by, schema.user.id))
        .where(
            and(
                between(stockHistory.change_date, from, to),
                eq(stockHistory.status, "ACTIVE")
            )
        )
        .orderBy(desc(stockHistory.change_date));

    // Define the type for product stock history result
    type ProductStockHistory = {
        productName: string;
        productId: string;
        date: string;
        previousStock: string;
        newStock: string;
        changeAmount: string;
        changedBy: string | null;
        changeReason: string;
        changeNote: string | null;
        stock: number;
        cumulative: number;
    };

    // Calculate cumulative values for each product
    const cumulativeMap = new Map<string, number>(); // productName -> cumulative stock
    const result: ProductStockHistory[] = [];

    for (const record of stockHistoryData) {
        const key = record.productName;
        const currentCumulative = cumulativeMap.get(key) || 0;
        const newCumulative = currentCumulative + Number(record.changeAmount);

        cumulativeMap.set(key, newCumulative);

        result.push({
            productName: record.productName,
            productId: record.productId,
            date: record.date,
            previousStock: record.previousStock,
            newStock: record.newStock,
            changeAmount: String(record.changeAmount),
            changedBy: record.changedBy,
            changeReason: record.changeReason,
            changeNote: record.changeNote,
            stock: Number(record.newStock),
            cumulative: newCumulative,
        });
    }
    return result;
};

// Today's metrics versions
const getTodayProductMetrics = async (db: DbType): Promise<DailyMetric[]> => {
    return getTodayMetricsHelper(
        db,
        product,
        product.createdAt,
        sql<number>`COUNT(*)`
    );
};

const getTodayCashSaleMetrics = async (db: DbType): Promise<DailyMetric[]> => {
    return getTodayMetricsHelper(
        db,
        invoice,
        invoice.createdAt,
        sql<number>`COALESCE(SUM(${invoice.totalAmount}), 0)`,
        eq(invoice.saleType, "CASH")
    );
};

const getTodayCreditSaleMetrics = async (db: DbType): Promise<DailyMetric[]> => {
    return getTodayMetricsHelper(
        db,
        invoice,
        invoice.createdAt,
        sql<number>`COALESCE(SUM(${invoice.totalAmount}), 0)`,
        eq(invoice.saleType, "CREDIT")
    );
};

const getTodayCreditRepaymentsMetrics = async (db: DbType): Promise<DailyMetric[]> => {
    return getTodayMetricsHelper(
        db,
        creditRepayment,
        creditRepayment.paymentDate,
        sql<number>`COALESCE(SUM(${creditRepayment.amountPaid}), 0)`
    );
};

const getTodayExpensesMetrics = async (db: DbType): Promise<DailyMetric[]> => {
    return getTodayMetricsHelper(
        db,
        expenses,
        expenses.expenseDate,
        sql<number>`COALESCE(SUM(${expenses.amount}), 0)`
    );
};

const getTodayProfitMetrics = async (db: DbType): Promise<DailyMetric[]> => {
    return getTodayMetricsHelper(
        db,
        invoice,
        invoice.createdAt,
        sql<number>`COALESCE(SUM(${invoice.saleProfit}), 0)`
    );
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
                // Get daily metrics for each category using the new procedures
                const [
                    totalProducts,
                    cashSales,
                    creditSales,
                    creditRepayments,
                    expensesData,
                    profitData,
                ] = await Promise.all([
                    getDailyProductMetrics(db, from, to),
                    getDailyCashSaleMetrics(db, from, to),
                    getDailyCreditSaleMetrics(db, from, to),
                    getDailyCreditRepaymentsMetrics(db, from, to),
                    getDailyExpensesMetrics(db, from, to),
                    getDailyProfitMetrics(db, from, to),
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
                // Get today's metrics for each category using the new procedures
                const [
                    totalProducts,
                    cashSales,
                    creditSales,
                    creditRepayments,
                    expensesData,
                    profitData,
                ] = await Promise.all([
                    getTodayProductMetrics(db),
                    getTodayCashSaleMetrics(db),
                    getTodayCreditSaleMetrics(db),
                    getTodayCreditRepaymentsMetrics(db),
                    getTodayExpensesMetrics(db),
                    getTodayProfitMetrics(db),
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

    // New endpoint for product stock history
    getProductStockHistory: base
        .use(authMiddleware)
        .input(dashboardSummarySchema)
        .handler(async ({ context: { db }, input }) => {
            // Use provided dates or default to current month
            const { from, to } = input.from && input.to
                ? { from: input.from, to: input.to }
                : getMonthDateRange();

            try {
                const stockHistory = await getDailyProductStockHistory(db, from, to);
                return stockHistory;
            } catch (e) {
                console.error("Error fetching product stock history:", e);
                throw new Error("Failed to get product stock history");
            }
        }),

    // New endpoint for today's product metrics based on availableStock and minimumStock
    getTodayLowProductCountMetrics: base
        .use(authMiddleware)
        .handler(async ({ context: { db } }) => {
            try {
                const [{ count }] = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(product)
                    .where(lte(product.availableStock, product.minimumStock));

                return {
                    lowStockProductCount: Number(count),
                };
            } catch (e) {
                console.error("Error fetching today's low stock product count:", e);
                throw new Error("Failed to get today's low stock product count");
            }
        }),
};