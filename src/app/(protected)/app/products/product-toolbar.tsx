// src/app/(protected)/app/products/product-toolbar.tsx

"use client";
import { Button, Input, Skeleton } from "@heroui/react";
import { PlusIcon, ShoppingCartIcon } from "lucide-react";

type ProductToolbarProps = {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddClick: () => void;
    onCheckoutClick: () => void; // Add this prop
    currentPage: number;
    pageSize: number;
    totalCount: number;
    isLoading?: boolean;
    cartCount: number;
};

export function ProductToolbar({
    searchTerm,
    onSearchChange,
    onAddClick,
    currentPage,
    pageSize,
    totalCount,
    isLoading = false,
    cartCount,
    onCheckoutClick
}: ProductToolbarProps) {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center overflow-clip">
                <h1 className="text-2xl font-bold">Products</h1>
                <div className="flex items-center gap-4">
                    <Button
                        color="primary"
                        onPress={onCheckoutClick}
                        endContent={<ShoppingCartIcon className="h-4 w-4" />}
                        isDisabled={isLoading || cartCount === 0}
                        aria-label={`Checkout, ${cartCount} items in cart`} // Accessibility label
                    >
                        Checkout ({cartCount})
                    </Button>
                    <Button
                        color="primary"
                        onPress={onAddClick}
                        endContent={<PlusIcon className="h-4 w-4" />}
                        isDisabled={isLoading}
                        aria-label="Add Product" // Accessibility label
                    >
                        Add Product
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 mb-4 overflow-clip">
                <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="max-w-sm"
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