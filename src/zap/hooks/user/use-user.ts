// src/zap/hooks/user/use-user.tsx
"use client";
import "client-only";

import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { SETTINGS } from "@/data/settings";
import { authClient } from "@/zap/lib/auth/client";
import { handleCompromisedPasswordError } from "@/zap/lib/auth/utils";
import { client } from "@/zap/lib/orpc/client";
import { getErrorMessage } from "@/zap/lib/util/common.util";
import { DEFAULT_PAGE_SIZE } from "@/zap/lib/util/constants";
import { AddUserInput, UpdateUserInput } from "@/zap/schemas/auth.schema";
import { User } from "@/zap/types/infer-rpc";

import { useDebounce } from "../use-debounce";

export function useUser() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Get all users with pagination
    const { data: users, mutate: refreshUsers } = useSWR(
        ["users", pagination.page, pagination.pageSize, debouncedSearchTerm],
        async ([, page, pageSize, search]) => {
            try {
                const result = await client.users.listUsers({
                    page,
                    pageSize,
                    search,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                });

                if (result instanceof Error || !result) {
                    toast.error("Failed to fetch users");
                    return { users: [], total: 0 };
                }

                return { users: result.data, total: result.data.total };
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Failed to fetch users");
                return { users: [], total: 0 };
            }
        }
    );

    // Get single user
    const { data: currentUser } = useSWR(
        selectedUser ? `user-${selectedUser.id}` : null,
        async () => {
            try {
                const result = await client.users.getUserById({
                    id: String(selectedUser?.id),
                });

                if (result instanceof Error || !result) {
                    toast.error("Failed to fetch user details");
                    return null;
                }

                return result;
            } catch (error) {
                console.error("Error fetching user by ID:", error);
                toast.error("Failed to fetch user details");
                return null;
            }
        }
    );

    // Add user
    const { trigger: addUser, isMutating: isAdding } = useSWRMutation(
        "add-user",
        async (_key, { arg }: { arg: AddUserInput }) => {
            try {
                const { name, email, password, role } = arg;
                const result = await authClient.signUp.email({
                    email,
                    password,
                    name,
                    role,
                });

                if (result.error) {
                    handleCompromisedPasswordError(result.error);
                    return false;
                }

                if (SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION) {
                    toast.success(
                        "Registration successful! Please check your email to verify your account."
                    );
                } else {
                    await refreshUsers();
                    toast.success("Registration successful!");
                }

                return true;
            } catch (error) {
                console.error("Error adding user:", error);
                toast.error("Failed to register user");
                return false;
            }
        }
    );

    // Update user
    const { trigger: updateUser, isMutating: isUpdating } = useSWRMutation(
        "update-user",
        async (_key, { arg }: { arg: { id: string; data: UpdateUserInput } }) => {
            try {
                const result = await client.users.updateUser({
                    id: arg.id,
                    ...arg.data,
                });

                if (result.success) {
                    await refreshUsers();
                    setSelectedUser(null);
                    toast.success("User updated successfully");
                    return true;
                } else {
                    toast.error(result.message || "Failed to update user");
                    return false;
                }
            } catch (error) {
                console.error("Error updating user:", error);
                const message = getErrorMessage(error, "Failed to update user");
                toast.error(message);
                return false;
            }
        }
    );

    // Delete user
    const { trigger: deleteUser, isMutating: isDeleting } = useSWRMutation(
        "delete-user",
        async (_key, { arg }: { arg: { id: string } }) => {

            // Add delay for testing
            await new Promise(resolve => setTimeout(resolve, 5000));

            try {
                const result = await client.users.deleteUser({ id: arg.id });

                if (result.success) {
                    await refreshUsers();
                    toast.success("User deleted successfully");
                    return true;
                } else {
                    toast.error("Failed to delete user");
                    return false;
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("Failed to delete user");
                return false;
            }
        }
    );

    const setPage = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const setPageSize = (pageSize: number) => {
        setPagination((prev) => ({ ...prev, pageSize, page: 0 }));
    };

    return {
        // State
        users: users?.users ?? [],
        currentUser,
        selectedUser,
        setSelectedUser,
        pagination,
        setPage,
        setPageSize,
        totalCount: users?.total ?? 0,

        // Actions
        addUser,
        updateUser,
        deleteUser,
        refreshUsers,

        // Loading states
        isLoading: !users,
        isAdding,
        isUpdating,
        isDeleting,

        // Search
        searchTerm,
        setSearchTerm,
    };
}
