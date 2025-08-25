// src/zap/hooks/product/use-cart-products.ts
"use client";
import useSWR from 'swr';

import { client } from '@/zap/lib/orpc/client';

export const useCartProducts = (cartItems: { productId: string; quantity: number }[]) => {
    // Extract product IDs from cart items
    const productIds = cartItems.map(item => item.productId);

    return useSWR(
        productIds.length > 0 ? ['cart-products', productIds] : null,
        async () => {
            try {
                const result = await client.products.getProductsByIds({ ids: productIds });

                if (!result.success) {
                    console.error(result.message || "Failed to fetch cart products");
                    return [];
                }

                return result.data.products;
            } catch (error) {
                console.error("Error fetching cart products:", error);
                return [];
            }
        }
    );
};