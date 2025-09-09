// src/app/(protected)/app/products/product-table.tsx
"use client";
import { Button, Skeleton } from '@heroui/react';
import { EditIcon, ShoppingCartIcon } from 'lucide-react';
import { MinusIcon, PlusIcon } from "lucide-react";
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { capitalizeString, formatCurrency } from '@/zap/lib/util/common.client.util';
import { Product } from '@/zap/types/infer-rpc';

export function ProductTable({
    products,
    isLoading,
    rpp,
    onAddToCart,
    cartItems,
    onUpdateCartQuantity,
    onEdit,
    onProductStockEdit
}: {
    products: Product[];
    isLoading: boolean;
    isDeleting: boolean;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onView: (product: Product) => void;
    rpp: number;
    onAddToCart: (product: Product, quantity: number) => void;
    cartItems: { productId: string; quantity: number }[];
    onUpdateCartQuantity: (productId: string, quantity: number) => void; // Add this prop
    onProductStockEdit: (product: Product) => void; // Add this prop
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {isLoading ? (
                // Card loading skeletons
                Array.from({ length: rpp }).map((_, i) => (
                    <Card key={`skeleton-${i}`} className="h-full flex flex-col overflow-hidden shadow-md">
                        <div className="bg-gray-200 border-2 border-dashed rounded-t-xl w-full h-48 animate-pulse" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4 mb-2 mx-auto" />
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <Skeleton className="h-6 w-1/2 mx-auto" />
                            <Skeleton className="h-5 w-3/4 mx-auto" />
                        </CardContent>
                        <CardFooter className="flex justify-between mt-auto">
                            <Skeleton className="h-8 w-20 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </CardFooter>
                    </Card>
                ))
            ) : products.length > 0 ? (
                products.map((product) => {
                    const cartItem = cartItems.find(item => item.productId === product.id);
                    const currentQuantity = cartItem ? cartItem.quantity : 0;
                    const isInCart = currentQuantity > 0;

                    return (
                        <Card key={product.id} className="h-full flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                            {/* Image placeholder */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b rounded-t-xl w-full h-48 flex items-center justify-center p-4 relative">
                                <div className="bg-white rounded-lg w-16 h-16 flex items-center justify-center">
                                    <span className="text-2xl">📦</span>
                                </div>

                                {/* Edit product button (top-left) */}
                                <Button
                                    size="sm"
                                    onPress={() => onEdit(product)}
                                    className="absolute top-2 left-2 p-1.5 rounded-full bg-white shadow hover:bg-gray-100 transition"
                                >
                                    <EditIcon className="w-4 h-4 text-gray-600" />
                                </Button>

                                {/* Cart status indicator */}
                                <div className="absolute top-2 right-2">
                                    {product.stock === 0 ? (
                                        <Badge variant="destructive">
                                            Out of Stock
                                        </Badge>
                                    ) : isInCart ? (
                                        <Badge variant="default">
                                            In Cart
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Available
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold text-center line-clamp-2 h-14 flex items-center justify-center">
                                    {product.name}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex-grow flex flex-col items-center">
                                <div className="text-2xl font-bold text-blue-600 mb-3">
                                    {formatCurrency(product.sellingPrice)}
                                </div>

                                <div className="text-sm text-muted-foreground text-center">
                                    {product.category?.name || 'Uncategorized'}
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between mt-auto pt-4">
                                <div className="group inline-block relative">
                                    <Badge
                                        title='Click to edit stock'
                                        variant={product.stock < product.minimumStock ? "destructive" : "default"}
                                        className="px-3 py-1.5 cursor-pointer transition-all duration-20 group-hover:pr-8"
                                        onClick={() => onProductStockEdit(product)}
                                    >
                                        {product.stock} {capitalizeString(product.unit?.acronym || "pcs")}
                                    </Badge>
                                    {/* Edit icon that appears on hover */}
                                    <EditIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-200 text-blue-500" />
                                </div>


                                {isInCart ? (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            aria-label='Decrease quantity' // Accessibility label
                                            size="sm"
                                            isIconOnly
                                            onPress={() => onUpdateCartQuantity(product.id, currentQuantity - 1)}
                                            className={`h-8 w-8 p-0 ${currentQuantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={currentQuantity <= 0}
                                        >
                                            <MinusIcon className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm font-medium">{currentQuantity}</span>
                                        <Button
                                            aria-label='Increase quantity' // Accessibility label
                                            size="sm"
                                            isIconOnly
                                            onPress={() => onUpdateCartQuantity(product.id, currentQuantity + 1)}
                                            disabled={currentQuantity >= Number(product.stock)}
                                            className={`h-8 w-8 p-0 ${currentQuantity >= Number(product.stock) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        aria-label='Add to cart' // Accessibility label
                                        disabled={product.stock === 0}
                                        size="sm"
                                        onPress={() => onAddToCart(product, 1)}
                                        className={`bg-blue-500 hover:bg-blue-600 text-white ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <ShoppingCartIcon className="h-4 w-4 mr-1" />
                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })
            ) : (
                <div className="col-span-full text-center py-24">
                    <p className="text-xl text-muted-foreground">No products found</p>
                </div>
            )}
        </div >
    );
}