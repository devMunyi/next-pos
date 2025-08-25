// src/app/(protected)/app/products/page.tsx
"use client";
import {
  useDisclosure
} from "@heroui/react";
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { mutate } from "swr";

import { AddEditForm } from '@/components/add-edit-form';
import { AddEditModal } from '@/components/add-edit-modal';
import { useCategory } from '@/zap/hooks/category/use-category';
import { useOrders } from '@/zap/hooks/orders/use-orders';
import { useProduct } from '@/zap/hooks/product/use-product';
import { useUnit } from '@/zap/hooks/unit/use-units';
import { CreateOrderInput } from '@/zap/schemas/orders.schema';
import { CreateProductInput, createProductSchema } from '@/zap/schemas/product.schema';
import { Product } from '@/zap/types/infer-rpc';

import { Pagination } from '../../../../components/pagination';
import { CheckoutModal } from './checkout-modal';
import { ProductTable } from './product-table';
import { ProductToolbar } from './product-toolbar';
import { StockUpdateModal } from "./stock-update-modal";
import { useProductFormFields } from "./use-product-form-fields";

export default function ProductPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isCheckoutOpen,
    onOpen: onCheckoutOpen,
    onOpenChange: onCheckoutOpenChange
  } = useDisclosure();

  const {
    isOpen: isStockOpen,
    onOpen: onStockOpen,
    onOpenChange: onStockOpenChange
  } = useDisclosure();

  const { createOrder, isCreating } = useOrders();
  const [isEditing, setIsEditing] = useState(false);
  const [, setCurrentProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<{ productId: string; quantity: number }[]>([]);
  const {
    products,
    selectedProduct,
    setSelectedProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    pagination,
    setPage,
    setPageSize,
    totalCount,
    isLoading,
    isAdding,
    isUpdating,
    isDeleting,
    searchTerm,
    setSearchTerm,
    refreshProducts,
    updateStock,
    isUpdatingStock,
  } = useProduct();
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number | null>(null);

  const { allUnits, allLoading: allUnitsLoading } = useUnit();
  const { allCategories, allLoading: allCategoriesLoading } = useCategory();

  const productFormFields = useProductFormFields(
    isEditing,
    allUnits,
    allUnitsLoading,
    allCategories,
    allCategoriesLoading
  );

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      code: '',
      name: '',
      unitId: '',
      categoryId: '',
      purchasePrice: 0,
      sellingPrice: 0,
      availableStock: 0,
      minimumStock: 0,
      description: '',
      status: 'ACTIVE',
    },
  });

  const handleEdit = useCallback((product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setSelectedProduct(product);
    form.reset({
      code: product.code,
      name: product.name,
      unitId: product.unit?.id,
      categoryId: product.category?.id,
      purchasePrice: Number(product.originalPrice),
      sellingPrice: Number(product.sellingPrice),
      availableStock: Number(product.stock),
      minimumStock: Number(product.minimumStock),
      description: product.description ?? '',
      status: product.status,
    });
    onOpen();
  }, [form, onOpen, setSelectedProduct]);

  // Add to cart handler
  const handleAddToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.productId === product.id);

      if (existingItem) {
        // Update quantity if product already in cart
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new product to cart
        return [...prev, { productId: product.id, quantity }];
      }
    });
  }, []);

  // Add a function to update quantity for a specific product
  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems(prev => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return prev.filter(item => item.productId !== productId);
      }

      return prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );
    });
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddClick = useCallback(() => {
    setCurrentProduct(null);
    setIsEditing(false);
    setSelectedProduct(null);
    form.reset({
      code: '',
      name: '',
      unitId: '',
      categoryId: '',
      purchasePrice: 0,
      sellingPrice: 0,
      availableStock: 0,
      minimumStock: 0,
      description: '',
      status: 'ACTIVE',
    });
    onOpen();
  }, [form, onOpen, setSelectedProduct]);


  // Add a function to handle checkout
  const handleCheckout = useCallback(async (data: CreateOrderInput) => {
    // Format the cart items for the order
    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const response = await createOrder({
      ...data,
      items: orderItems,
    });


    // Clear the cart on success
    if (!response) return;

    setCartItems([]);
    onCheckoutOpenChange();
    await mutate((key) => Array.isArray(key) && key[0] === "products");
  }, [cartItems, createOrder, onCheckoutOpenChange]);


  const onSubmit = useCallback(
    async (values: CreateProductInput) => {
      try {
        if (isEditing && selectedProduct) {
          await updateProduct({ id: selectedProduct.id, data: values });
        } else {
          await addProduct(values);
        }
        onOpenChange();
        form.reset();
      } catch (error) {
        console.error('Error submitting product:', error);
        toast.error('Operation failed');
      }
    },
    [isEditing, selectedProduct, updateProduct, addProduct, onOpenChange, form]
  );

  // Handle search with debounce
  useEffect(() => {
    refreshProducts();
  }, [searchTerm, pagination.page, pagination.pageSize, refreshProducts]);

  const handleDelete = useCallback((id: string) => {
    deleteProduct({ id });
  }, [deleteProduct]);

  const handleView = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, [setSelectedProduct]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  }, [setSearchTerm, setPage]);


  const handleProductStockEdit = (product: Product) => {
    setStockProduct(product);
    setStockQuantity(product.stock);
    onStockOpen();
  };

  // submit handler
  const handleStockUpdateSubmit = async (data: { availableStock: number }) => {
    if (!stockProduct) return;
    await updateStock({
      id: stockProduct.id,
      availableStock: data.availableStock,
    });
    onStockOpenChange();
    setStockProduct(null);
    setStockQuantity(null);
  };


  return (
    <div className="container mx-auto py-8">
      <ProductToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
        onCheckoutClick={onCheckoutOpen} // Add this prop
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
        totalCount={totalCount}
        isLoading={isLoading}
        cartCount={cartCount}
      />

      <StockUpdateModal
        isOpen={isStockOpen}
        onOpenChange={onStockOpenChange}
        onSubmit={handleStockUpdateSubmit}
        isSubmitting={isUpdatingStock}
        initialStock={stockQuantity ?? 0}
        productId={stockProduct?.id ?? ''}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onOpenChange={onCheckoutOpenChange}
        cartItems={cartItems}
        // products={products}
        onSubmit={handleCheckout}
        isSubmitting={isCreating}
        onUpdateCartQuantity={updateCartQuantity}
      />

      <div className="rounded-md border">
        <ProductTable
          products={products}
          isLoading={isLoading}
          isDeleting={isDeleting}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          rpp={pagination.pageSize}
          onAddToCart={handleAddToCart}
          cartItems={cartItems}
          onUpdateCartQuantity={updateCartQuantity}
          onProductStockEdit={handleProductStockEdit}
        />
      </div>

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
      />

      {/* Add Edit Modal */}
      <AddEditModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={isEditing ? 'Edit Product' : 'Add New Product'}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={isAdding || isUpdating}
        submitLabel={isEditing ? 'Update' : 'Create'}
      >
        <AddEditForm
          form={form} // Pass the form instance
          fields={productFormFields}
          columns={{ base: 1, md: 2, lg: 2 }}
        />
      </AddEditModal>
    </div>
  );
}