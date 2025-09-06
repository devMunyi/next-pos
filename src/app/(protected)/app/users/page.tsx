"use client";
import { useDisclosure } from "@heroui/react";
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { AddEditForm } from '@/components/add-edit-form';
import { AddEditModal } from '@/components/add-edit-modal';
import { Pagination } from '@/components/pagination';
import { useUser } from '@/zap/hooks/user/use-user';
import { addUserFormFields, editUserFormFields } from '@/zap/lib/util/constants';
import { AddUserInput, addUserSchema, UpdateUserInput, updateUserSchema } from '@/zap/schemas/auth.schema';
import { User } from '@/zap/types/infer-rpc';

import { UserTable } from './user-table';
import { UserToolbar } from './user-toolbar';


export default function UsersPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    users,
    selectedUser,
    setSelectedUser,
    addUser,
    updateUser,
    deleteUser,
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
    refreshUsers,
  } = useUser();

  const addForm = useForm<AddUserInput>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'CASHIER',
      password: '',
    },
  });

  const editForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'CASHIER',
      password: ''

    },
  });

  console.log({ currentUser });

  // Update editForm when currentUser changes
  useEffect(() => {
    if (currentUser) {
      editForm.reset({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        password: '',
      });
    }
  }, [currentUser, editForm]);

  const handleEdit = useCallback((user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    setSelectedUser(user);
    onOpen();
  }, [onOpen, setSelectedUser]);

  const handleAddClick = useCallback(() => {
    setCurrentUser(null);
    setIsEditing(false);
    setSelectedUser(null);
    addForm.reset({
      name: '',
      email: '',
      role: 'CASHIER',
      password: '',
    });
    onOpen();
  }, [addForm, onOpen, setSelectedUser]);

  const handleAddSubmit: SubmitHandler<AddUserInput> = useCallback(async (values) => {
    try {
      await addUser(values);
      onOpenChange();
      addForm.reset();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "PASSWORD_COMPROMISED"
      ) {
        // toasted error from handleCompromisedPasswordError
      } else {
        // toast.error(getErrorMessage(error));
      }
    }
  }, [addUser, onOpenChange, addForm]);

  const handleEditSubmit: SubmitHandler<UpdateUserInput> = useCallback(async (values) => {

    if (!selectedUser) return;

    const updateData = {
      ...values,
      password: values.password || undefined
    };

    await updateUser({
      id: selectedUser.id,
      data: updateData
    });
    onOpenChange();
    editForm.reset();
  }, [updateUser, onOpenChange, editForm, selectedUser]);

  // Handle search with debounce
  useEffect(() => {
    refreshUsers();
  }, [searchTerm, pagination.page, pagination.pageSize, refreshUsers]);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id); // Set the ID of the user being deleted
    try {
      await deleteUser({ id });
    } finally {
      setDeletingId(null); // Reset after delete completes (success or failure)
    }
  }, [deleteUser]);

  const handleView = useCallback((user: User) => {
    setSelectedUser(user);
  }, [setSelectedUser]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, [setSearchTerm, setPage]);

  return (
    <div className="">
      <UserToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
        totalCount={totalCount}
        isLoading={isLoading}
      />

      <div className="rounded-md border">
        <UserTable
          users={Array.isArray(users) ? users : users.users}
          isLoading={isLoading}
          isDeleting={isDeleting}
          deletingId={deletingId} // Pass the specific ID being deleted
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          rpp={pagination.pageSize}
        />
      </div>

      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
      />

      <AddEditModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={isEditing ? 'Edit User' : 'Add New User'}
        onSubmit={isEditing
          ? editForm.handleSubmit(handleEditSubmit)
          : addForm.handleSubmit(handleAddSubmit)}
        isSubmitting={isAdding || isUpdating}
        submitLabel={isEditing ? 'Update' : 'Create'}
      >
        {
          isEditing ? (
            <AddEditForm form={editForm} fields={editUserFormFields} />
          ) : (
            <AddEditForm form={addForm} fields={addUserFormFields} />
          )
        }
      </AddEditModal>
    </div>
  );
}