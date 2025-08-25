// src/app/(protected)/app/products/checkout-modal.tsx

"use client";
import { Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MinusIcon, PlusIcon } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AddEditForm } from "@/components/add-edit-form";
import { AddEditModal } from "@/components/add-edit-modal";
import {
    CreateOrderInput,
    createOrderSchema,
    createOrderSchemaPermissive,
} from "@/zap/schemas/orders.schema";
import { Product } from "@/zap/types/infer-rpc";

import { checkoutFields } from "./fields";
import { useCartProducts } from "./use-cart-products";

type CheckoutModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    cartItems: { productId: string; quantity: number }[];
    // products: Product[];
    onSubmit: (data: CreateOrderInput) => void;
    isSubmitting: boolean;
    onUpdateCartQuantity: (productId: string, quantity: number) => void; // Add this prop
};

export function CheckoutModal({
    isOpen,
    onOpenChange,
    cartItems,
    // products,
    onSubmit,
    isSubmitting,
    onUpdateCartQuantity, // Add this prop
}: CheckoutModalProps) {

    const { data: cartProducts } = useCartProducts(cartItems);

    const form = useForm<z.infer<typeof createOrderSchema>>({
        resolver: zodResolver(createOrderSchemaPermissive),
        defaultValues: {
            saleType: "CASH",
            items: cartItems,
            customerPhoneNumber: "",
            creditDueDate: "",
            paidAmount: 0,
        },
    });

    // Reset form when modal opens or cartItems change
    useEffect(() => {
        if (isOpen) {
            form.reset({
                saleType: "CASH",
                items: cartItems,
                customerPhoneNumber: "",
                creditDueDate: "",
                paidAmount: 0,
            });
        }
    }, [isOpen, cartItems, form]);

    // close modal if cart is empty
    useEffect(() => {
        if (cartItems.length === 0 && isOpen) {
            onOpenChange(false);
        }
    }, [cartItems, isOpen, onOpenChange]);

    // Add this useEffect to reset form after successful submission
    useEffect(() => {
        if (!isSubmitting && form.formState.isSubmitSuccessful) {
            // Small delay to allow the modal closing animation to complete
            const timer = setTimeout(() => {
                form.reset({
                    saleType: "CASH",
                    items: [],
                    customerPhoneNumber: "",
                    creditDueDate: "",
                    paidAmount: 0,
                });
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isSubmitting, form.formState.isSubmitSuccessful, form]);

    const saleType = form.watch("saleType");

    React.useEffect(() => {
        if (saleType === "CASH") {
            form.clearErrors(["customerPhoneNumber", "creditDueDate"]);
        }
        if (saleType === "CREDIT") {
            form.clearErrors(["paidAmount"]);
        }
    }, [saleType, form]);

    const getCartProductsArray = () => {
        if (Array.isArray(cartProducts)) return cartProducts;
        if (
            cartProducts &&
            typeof cartProducts === "object" &&
            "products" in cartProducts &&
            Array.isArray((cartProducts as { products?: Product[] }).products)
        ) {
            return (cartProducts as { products: Product[] }).products;
        }
        return [];
    };

    const totalAmount = cartItems.reduce((total, item) => {
        const productsArray = getCartProductsArray();
        const product = productsArray.find((p) => p.id === item.productId);
        if (!product) return total;
        return total + Number(product.sellingPrice) * item.quantity;
    }, 0);

    const handleFormSubmit = (data: z.infer<typeof createOrderSchemaPermissive>) => {
        const submitData: CreateOrderInput = {
            ...data,
            items: cartItems,
            customerPhoneNumber: data.customerPhoneNumber || undefined,
            creditDueDate: data.creditDueDate || undefined,
        };
        onSubmit(submitData);
    };

    return (
        <AddEditModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Checkout"
            submitLabel="Create Order"
            onSubmit={form.handleSubmit(handleFormSubmit)}
            isSubmitting={isSubmitting}
        >
            <div className="space-y-4">
                {/* Order Summary */}
                <div>
                    <h3 className="font-semibold mb-2">Order Summary</h3>
                    <div className="border rounded-md divide-y">
                        {cartItems.map((item) => {
                            const product = (cartProducts ?? []).find((p) => p.id === item.productId);
                            if (!product) return null;

                            return (
                                <div
                                    key={item.productId}
                                    className="p-3 flex justify-between items-center"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {item.quantity} x {Number(product.sellingPrice).toLocaleString("en-US")}
                                        </p>
                                    </div>

                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-2 ml-2">
                                        <Button
                                            aria-label="Decrease quantity" // Accessibility label
                                            isIconOnly
                                            onPress={() => onUpdateCartQuantity(product.id, item.quantity - 1)}
                                            disabled={item.quantity <= 0}
                                            className={`h-8 w-8 p-0 min-w-0 ${item.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <MinusIcon className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm font-medium w-6 text-center">
                                            {item.quantity}
                                        </span>
                                        <Button
                                            aria-label="Increase quantity" // Accessibility label
                                            isIconOnly
                                            onPress={() => onUpdateCartQuantity(product.id, item.quantity + 1)}
                                            disabled={item.quantity >= Number(product.stock)}
                                            className={`h-8 w-8 p-0 min-w-0 ${item.quantity >= Number(product.stock) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <p className="font-medium ml-4 w-30 text-right">
                                        {(Number(product.sellingPrice) * item.quantity).toLocaleString(
                                            "en-US",
                                            {
                                                style: "currency",
                                                currency: "KSH",
                                            }
                                        )}
                                    </p>
                                </div>
                            );
                        })}
                        <div className="p-3 flex justify-between items-center font-bold border-t-2">
                            <p>Total</p>
                            <p>
                                {totalAmount.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "KSH",
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reusable form */}
                <AddEditForm
                    form={form}
                    fields={checkoutFields.filter(
                        (f) => !(saleType === "CASH" && f.name === "creditDueDate")
                    )}
                    columns={{ base: 1, md: 2 }}
                />
            </div>
        </AddEditModal >
    );
}