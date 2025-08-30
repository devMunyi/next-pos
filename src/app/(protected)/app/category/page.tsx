// src/app/(protected)/app/category/page.tsx
"use client";
import {
  useDisclosure
} from "@heroui/react";
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AddEditForm, FormField } from '@/components/add-edit-form';
import { AddEditModal } from '@/components/add-edit-modal';
import { useCategory } from '@/zap/hooks/category/use-category';
import { createCategoryFormSchema, CreateCategoryInput, createCategorySchema, ReadCategoryInput } from '@/zap/schemas/category.schema';

import { Pagination } from '../../../../components/pagination';
import { CategoryTable } from './category-table';
import { CategoryToolbar } from './category-toolbar';

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const categoryFormFields: FormField<typeof createCategoryFormSchema>[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
  },
  {
    name: "description",
    label: "Description",
    type: "text",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: statusOptions,
  },
];


export default function CategoryPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [, setCurrentCategory] = useState<ReadCategoryInput | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    addCategory,
    updateCategory,
    deleteCategory,
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
    refreshCategories,
  } = useCategory();


  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
    },
  });

  const handleEdit = useCallback((category: ReadCategoryInput) => {
    setCurrentCategory(category);
    setIsEditing(true);
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      description: category.description ?? '',
      status: category.status,
    });
    onOpen();
  }, [form, onOpen, setSelectedCategory]);

  const handleAddClick = useCallback(() => {
    setCurrentCategory(null);
    setIsEditing(false);
    setSelectedCategory(null);
    form.reset({
      name: '',
      description: '',
      status: 'ACTIVE',
    });
    onOpen();
  }, [form, onOpen, setSelectedCategory]);


  const onSubmit = useCallback(async (values: CreateCategoryInput) => {
    if (isEditing && selectedCategory) {
      await updateCategory({ id: selectedCategory.id, data: values });
    } else {
      await addCategory(values);
    }
    onOpenChange();
    form.reset();
  }, [isEditing, selectedCategory, updateCategory, addCategory, onOpenChange, form]);


  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id); // Set the ID of the category being deleted
    try {
      await deleteCategory({ id });
    } finally {
      setDeletingId(null); // Reset after delete completes (success or failure)
    }
  }, [deleteCategory]);

  // const handleView = useCallback((category: ReadCategoryInput) => {
  //   setSelectedCategory(category);
  // }, [setSelectedCategory]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, [setSearchTerm, setPage]);

  // Handle search with debounce
  useEffect(() => {
    refreshCategories();
  }, [searchTerm, pagination.page, pagination.pageSize, refreshCategories]);

  return (
    <div className="container mx-auto py-8">
      <CategoryToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
        totalCount={totalCount}
        isLoading={isLoading}
      />

      <div className="rounded-md border">
        <CategoryTable
          categories={categories}
          isLoading={isLoading}
          isDeleting={isDeleting}
          deletingId={deletingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          // onView={handleView}
          rpp={pagination.pageSize}
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
        title={isEditing ? 'Edit Category' : 'Add New Category'}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={isAdding || isUpdating}
        submitLabel={isEditing ? 'Update' : 'Create'}
      >
        <AddEditForm
          form={form} // Pass the form instance
          fields={categoryFormFields}
          columns={{ base: 1, md: 2, lg: 2 }}
        />
      </AddEditModal>
    </div>
  );
}