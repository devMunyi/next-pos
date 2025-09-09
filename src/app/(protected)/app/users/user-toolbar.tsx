// src/app/(protected)/app/users/user-toolbar.tsx
"use client";
import { Button, Input, Skeleton } from "@heroui/react";
import { PlusIcon } from "lucide-react";

type UserToolbarProps = {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddClick: () => void;
    currentPage: number;
    pageSize: number;
    totalCount: number;
    isLoading?: boolean; // Add loading state prop
};

export function UserToolbar({
    searchTerm,
    onSearchChange,
    onAddClick,
    currentPage,
    pageSize,
    totalCount,
    isLoading = false,
}: UserToolbarProps) {
    // Calculate the range being shown
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center flex-wrap">
                <h1 className="text-2xl font-bold">Users</h1>
                <Button
                    color="primary"
                    onPress={onAddClick}
                    endContent={<PlusIcon className="h-4 w-4" />}
                    isDisabled={isLoading} // Disable button during loading
                >
                    Add User
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="max-w-sm"
                // isDisabled={isLoading} // Disable input during loading
                />

                {isLoading ? (
                    <Skeleton className="h-4 w-40 rounded-md" />
                ) : totalCount > 0 ? (
                    <div className="text-sm font-medium whitespace-nowrap">
                        Showing {startItem} to {endItem} of {totalCount}
                    </div>
                ) : null}
            </div>
        </div>
    );
}