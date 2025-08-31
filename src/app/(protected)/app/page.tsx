"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboard } from "@/zap/hooks/dashboard/use-dashboard";
import { DailyMetric, DashboardSummaryResponse } from "@/zap/types/infer-rpc";

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

// Helper function to get start and end of month
const getMonthDateRange = (): DateRange => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return { from, to };
};

// Calculate number of days between two dates with a maximum of 30
const getDaysInRange = (from?: Date, to?: Date): number => {
  if (!from || !to) return 7; // Default to 7 days if no range is selected

  const diffTime = Math.abs(to.getTime() - from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

  return Math.min(diffDays, 30); // Cap at 30 days
};

// Define metrics with proper typing
interface MetricConfig {
  key: keyof DashboardSummaryResponse;
  label: string;
  className: string;
}

const metrics: MetricConfig[] = [
  { key: "totalProducts", label: "Total Products", className: "bg-blue-500 text-white" },
  { key: "cashSales", label: "Cash Sales", className: "bg-green-500 text-white" },
  { key: "creditSales", label: "Credit Sales", className: "bg-yellow-500 text-white" },
  { key: "creditRepayments", label: "Credit Repayments", className: "bg-purple-500 text-white" },
  { key: "expenses", label: "Expenses", className: "bg-red-500 text-white" },
  { key: "profit", label: "Profit", className: "bg-teal-500 text-white" },
  // { key: "netProfit", label: "Net Profit" },
];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Set default date range to current month on component mount
  useEffect(() => {
    setDateRange(getMonthDateRange());
  }, []);

  const { summary, todaySummary, isLoading, isTodayLoading } = useDashboard(
    dateRange?.from ? formatDateToDBString(dateRange.from) : undefined,
    dateRange?.to ? formatDateToDBString(dateRange.to) : undefined
  );

  // Memoize the skeleton count based on date range
  const skeletonCount = useMemo(() => {
    return getDaysInRange(dateRange?.from, dateRange?.to);
  }, [dateRange?.from, dateRange?.to]);

  // Format currency values
  const formatCurrency = useMemo(() => (value: number) => {
    return `Ksh ${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, []);

  // Format date for display
  const formatDisplayDate = useMemo(() => (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  // Helper function to safely access metric data
  const getMetricData = useMemo(() => (key: keyof DashboardSummaryResponse): DailyMetric[] => {
    return summary[key] || [];
  }, [summary]);

  // Calculate today's totals
  const getTodayTotal = useMemo(() => (key: keyof DashboardSummaryResponse): number => {
    const data = todaySummary[key] || [];
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [todaySummary]);

  // Calculate cumulative data and totals for each metric
  const metricData = useMemo(() => {
    return metrics.reduce((acc, metric) => {
      const data = getMetricData(metric.key);

      // Sort data by date
      const sortedData = [...data].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate cumulative values
      let cumulative = 0;
      const dataWithCumulative = sortedData.map(item => {
        cumulative += item.value;
        return {
          ...item,
          cumulative
        };
      });

      // Calculate total
      const total = data.reduce((sum, item) => sum + item.value, 0);

      acc[metric.key] = {
        data: dataWithCumulative,
        total,
        cumulativeTotal: cumulative
      };

      return acc;
    }, {} as Record<string, { data: (DailyMetric & { cumulative: number })[], total: number, cumulativeTotal: number }>);
  }, [getMetricData]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Today's Summary Section */}
      <h2 className="text-xl font-semibold text-center">{`Today's Summary`}</h2>
      <div className="flex flex-col md:flex-row justify-around gap-4">
        {metrics.map((metric) => (
          <Card key={`today-${metric.key}`} className={`p-4 min-w-[200px] ${metric.className}`}>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium">{metric.label}:</h3>
            </CardHeader>
            <CardBody className="pt-0">
              {isTodayLoading ? (
                <Skeleton className="h-8 min-w-[200px] rounded-md" />
              ) : (
                <p className="text-xl font-bold">
                  {metric.key === "totalProducts"
                    ? getTodayTotal(metric.key)
                    : formatCurrency(getTodayTotal(metric.key))
                  }
                </p>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Date Filter for Historical Data */}
      <div className="flex items-center justify-center gap-6">
        <h2 className="text-xl font-semibold text-center flex-end">Daily Summary</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {dateRange?.from ? formatDisplayDate(dateRange.from.toISOString()) : ""} -{" "}
              {dateRange?.to ? formatDisplayDate(dateRange.to.toISOString()) : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Historical Data Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric) => {
          const { data, total } = metricData[metric.key] || { data: [], total: 0 };

          return (
            <Card key={metric.key} className={`p-4`}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{metric.label}:</h3>
                  <span className="mx-1" />
                  {isLoading ? (
                    <Skeleton className="h-6 min-w-32 rounded-md" />
                  ) : (
                    <div className="text-xl font-medium text-right text-muted-foreground">
                      {metric.key === "totalProducts"
                        ? total
                        : formatCurrency(total)
                      }
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <Table
                  color="success"
                  isVirtualized
                  aria-label={`${metric.label} table`}
                  isHeaderSticky
                  classNames={{
                    base: `max-h-[520px] overflow-y-scroll `,
                    table: "min-h-[400px]",
                  }}
                  key={`table-${metric.key}`}
                >
                  <TableHeader>
                    <TableColumn>Date</TableColumn>
                    <TableColumn>Daily</TableColumn>
                    <TableColumn>Cumulative</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Show loading skeletons based on date range
                      Array.from({ length: skeletonCount }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell><Skeleton className="h-4 w-24 rounded-md" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 rounded-md" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 rounded-md" /></TableCell>
                        </TableRow>
                      ))
                    ) : data.length > 0 ? (
                      data.map((item) => (
                        <TableRow key={item.date}>
                          <TableCell>
                            {formatDisplayDate(item.date)}
                          </TableCell>
                          <TableCell>
                            {metric.key === "totalProducts"
                              ? item.value
                              : formatCurrency(item.value)
                            }
                          </TableCell>
                          <TableCell>
                            {metric.key === "totalProducts"
                              ? item.cumulative
                              : formatCurrency(item.cumulative)
                            }
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No data available for the selected period.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Grand Totals Row */}
                {!isLoading && data.length > 0 && (
                  <div className="mt-4 p-2 bg-muted rounded-md">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Grand Total:</span>
                      <span>
                        {metric.key === "totalProducts"
                          ? total
                          : formatCurrency(total)
                        }
                      </span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}