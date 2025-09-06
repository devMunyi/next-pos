"use client";

import {
    Pagination as HeroPagination,
    Skeleton,
} from "@heroui/react";
import { useCallback } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"; // shadcn/ui select
import { PAGE_SIZE_OPTIONS } from "@/zap/lib/util/constants";

type PaginationProps = {
    page: number;
    pageSize: number;
    totalCount?: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    className?: string;
    isLoading?: boolean;
};

export function Pagination({
    page,
    pageSize,
    totalCount,
    onPageChange,
    onPageSizeChange,
    className = "",
    isLoading = false,
}: PaginationProps) {
    const pageCount = totalCount ? Math.ceil(totalCount / pageSize) : 0;

    const handlePageSizeChange = useCallback(
        (value: string) => {
            const newSize = Number(value);
            onPageSizeChange(newSize || Number(PAGE_SIZE_OPTIONS[0].key));
            onPageChange(1);
        },
        [onPageSizeChange, onPageChange]
    );

    if (isLoading) {
        return (
            <div className={`flex items-center justify-between py-4 ${className}`}>
                {/* Page Size Selector Skeleton */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                </div>

                {/* Pagination Skeleton */}
                <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-8 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-between py-4 ${className}`}>
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                    onValueChange={handlePageSizeChange}
                    defaultValue={String(pageSize || PAGE_SIZE_OPTIONS[0].key)}
                >
                    <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <SelectItem key={size.key} value={String(size.key)}>
                                {size.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Main Pagination */}
            {pageCount > 0 && (
                <HeroPagination
                    isCompact
                    showControls
                    total={pageCount}
                    page={page}
                    onChange={onPageChange}
                    color="primary"
                    classNames={{
                        wrapper: "gap-1",
                        item: "min-w-8 h-8",
                        cursor: "font-bold",
                    }}
                />
            )}
        </div>
    );
}
