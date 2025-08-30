// src/app/(protected)/app/products/stock-modal.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react"; // Add this import
import { useForm } from "react-hook-form";

import { AddEditForm } from "@/components/add-edit-form";
import { AddEditModal } from "@/components/add-edit-modal";
import { UpdateStockInput, updateStockSchema } from "@/zap/schemas/product.schema";

import { stockFields } from "./fields";

type StockUpdateModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (data: UpdateStockInput) => void;
    isSubmitting?: boolean;
    initialStock?: number;
    productId: string; // Add productId prop
};

export function StockUpdateModal({
    isOpen,
    onOpenChange,
    onSubmit,
    isSubmitting,
    initialStock,
    productId
}: StockUpdateModalProps) {
    const form = useForm<UpdateStockInput>({
        resolver: zodResolver(updateStockSchema),
        defaultValues: {
            id: productId, // Set the product ID
            availableStock: initialStock,
            reason: undefined,
            otherReason: undefined

        },
    });

    // Add this useEffect to reset form when initialStock changes
    useEffect(() => {
        form.reset({
            id: productId,
            availableStock: initialStock
        });
    }, [initialStock, productId, form]);

    return (
        <AddEditModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Update Stock"
            submitLabel="Update"
            onSubmit={form.handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
        >
            <AddEditForm
                form={form}
                fields={stockFields}
                columns={{ base: 1 }}
            />
        </AddEditModal>
    );
}