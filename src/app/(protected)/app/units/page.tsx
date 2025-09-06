// src/app/(protected)/app/units/page.tsx
"use client";
import {
  useDisclosure
} from "@heroui/react";
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { AddEditForm } from '@/components/add-edit-form';
import { AddEditModal } from '@/components/add-edit-modal';
import { useUnit } from '@/zap/hooks/unit/use-units';
import { unitFormFields } from '@/zap/lib/util/constants';
import { CreateUnitInput, createUnitSchema, ReadUnitInput } from '@/zap/schemas/unit.schema';

import { Pagination } from '../../../../components/pagination';
import { UnitTable } from './unit-table';
import { UnitToolbar } from './unit-toolbar';

export default function UnitsPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [, setCurrentUnit] = useState<ReadUnitInput | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    units,
    selectedUnit,
    setSelectedUnit,
    addUnit,
    updateUnit,
    deleteUnit,
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
    refreshUnits,
  } = useUnit();


  const form = useForm<CreateUnitInput>({
    resolver: zodResolver(createUnitSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
    },
  });

  const handleEdit = useCallback((unit: ReadUnitInput) => {
    setCurrentUnit(unit);
    setIsEditing(true);
    setSelectedUnit(unit);
    form.reset({
      name: unit.name,
      acronym: unit.acronym ?? '',
      description: unit.description ?? '',
      status: unit.status,
    }); // Reset form with unit data
    onOpen();
  }, [form, onOpen, setCurrentUnit, setIsEditing, setSelectedUnit]);

  const handleAddClick = useCallback(() => {
    setCurrentUnit(null);
    setIsEditing(false);
    setSelectedUnit(null);
    form.reset({
      name: '',
      acronym: '',
      description: '',
      status: 'ACTIVE',
    });
    onOpen();
  }, [form, onOpen, setCurrentUnit, setIsEditing, setSelectedUnit]);


  const onSubmit = useCallback(async (values: CreateUnitInput) => {
    try {
      if (isEditing && selectedUnit) {
        await updateUnit({ id: selectedUnit.id, data: values });
      } else {
        await addUnit(values);
      }
      onOpenChange();
      form.reset();
    } catch (error) {
      console.error('Error submitting unit:', error);
      toast.error('Operation failed');
    }
  }, [isEditing, selectedUnit, updateUnit, addUnit, onOpenChange, form]);

  // Handle search with debounce
  useEffect(() => {
    refreshUnits();
  }, [searchTerm, pagination.page, pagination.pageSize, refreshUnits]);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id); // Set the ID of the unit being deleted
    try {
      await deleteUnit({ id });
    } finally {
      setDeletingId(null); // Reset after delete completes (success or failure)
    }
  }, [deleteUnit]);

  const handleView = useCallback((unit: ReadUnitInput) => {
    setSelectedUnit(unit);
  }, [setSelectedUnit]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  }, [setSearchTerm, setPage]);


  return (
    <div className="">
      <UnitToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
        totalCount={totalCount}
        isLoading={isLoading}
      />

      <div className="rounded-md border">
        <UnitTable
          units={units}
          isLoading={isLoading}
          isDeleting={isDeleting}
          deletingId={deletingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
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
        title={isEditing ? 'Edit Unit' : 'Add New Unit'}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={isAdding || isUpdating}
        submitLabel={isEditing ? 'Update' : 'Create'}
      >
        <AddEditForm
          form={form} // Pass the form instance
          fields={unitFormFields}
        />
      </AddEditModal>
    </div>
  );
}