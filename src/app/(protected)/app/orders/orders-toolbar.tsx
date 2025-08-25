// src/app/(protected)/app/orders/orders-toolbar.tsx
"use client";
import { useRouter } from "@bprogress/next/app";
import { Button, Input, Skeleton } from "@heroui/react";
import { PlusIcon } from "lucide-react";

type OrdersToolbarProps = {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddClick: () => void;
    currentPage: number;
    pageSize: number;
    totalCount: number;
    isLoading?: boolean; // Add loading state prop
};

export function OrdersToolbar({
    searchTerm,
    onSearchChange,
    // onAddClick,
    currentPage,
    pageSize,
    totalCount,
    isLoading = false,
}: OrdersToolbarProps) {
    // Calculate the range being shown
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);
    const router = useRouter();

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Orders</h1>
                <Button
                    color="primary"
                    onPress={() => {
                        router.push("/app/products");
                    }}
                    endContent={<PlusIcon className="h-4 w-4" />}
                    isDisabled={isLoading} // Disable button during loading
                >
                    Add Order
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4">
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