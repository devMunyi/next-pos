// src/app/(protected)/app/category/components/category-toolbar.tsx
"use client";
import { Button, Input, Skeleton } from "@heroui/react";
import { PlusIcon } from "lucide-react";

type CategoryToolbarProps = {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddClick: () => void;
    currentPage: number;
    pageSize: number;
    totalCount: number;
    isLoading?: boolean; // Add loading state prop
};

export function CategoryToolbar({
    searchTerm,
    onSearchChange,
    onAddClick,
    currentPage,
    pageSize,
    totalCount,
    isLoading = false,
}: CategoryToolbarProps) {
    // Calculate the range being shown
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Categories</h1>
                <Button
                    color="primary"
                    onPress={onAddClick}
                    endContent={<PlusIcon className="h-4 w-4" />}
                    isDisabled={isLoading} // Disable during loading
                >
                    Add Category
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4">

                <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="max-w-sm"
                />

                {isLoading ? (
                    <Skeleton className="h-5 w-40 rounded-medium" /> // Matches text height
                ) : totalCount > 0 ? (
                    <div className="text-sm font-medium whitespace-nowrap">
                        Showing {startItem} to {endItem} of {totalCount}
                    </div>
                ) : null}
            </div>
        </div>
    );
}