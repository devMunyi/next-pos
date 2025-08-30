// src/app/(protected)/app/units/unit-table.tsx
"use client";
import { Badge, Skeleton } from '@heroui/react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import React from 'react';

import { ActionButton } from '@/components/actionButton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { capitalizeString } from '@/zap/lib/util/common.client.util';
import { fancyDate } from '@/zap/lib/util/date.util';
import { User } from '@/zap/types/infer-rpc';

export function UserTable({
    users,
    isLoading,
    isDeleting,
    deletingId,
    onEdit,
    onDelete,
    rpp, // rows per page
}: {
    users: User[];
    isLoading: boolean;
    isDeleting: boolean;
    deletingId: string | null;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
    onView: (user: User) => void;
    rpp: number; // optional prop for rows per page
}) {

    console.log({ deletingId, userId: users.map(u => u.id) });

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created At</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                    <TableHead>Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    // Show loading skeletons
                    Array.from({ length: rpp }).map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                            <TableCell><Skeleton className="h-4 w-4 rounded-lg" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px] rounded-lg" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px] rounded-lg" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[200px] rounded-lg" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px] rounded-lg" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[80px] rounded-lg" /></TableCell>
                            <TableCell className="flex space-x-2">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </TableCell>
                        </TableRow>
                    ))
                ) : users.length > 0 ? (
                    users.map((user, index) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{capitalizeString(user.role)}</TableCell>
                            <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                                <br />
                                <Badge color='primary' className='text-green-500'>{fancyDate(user.createdAt)}</Badge>
                            </TableCell>
                            {/* <TableCell>
                                <Badge
                                    variant={
                                        user.banned === false ? 'default' : 'secondary'
                                    }
                                >
                                    {user.banned === false ? 'Active' : 'Banned'}
                                </Badge>
                            </TableCell> */}
                            <TableCell className="flex space-x-2">
                                {/* Edit User */}
                                <ActionButton
                                    onAction={() => onEdit(user)}
                                    ariaLabel='Edit User'
                                    icon={PencilIcon}
                                    variant='ghost'
                                    isIconOnly
                                />

                                {/* Delete User */}
                                <ActionButton
                                    id={user.id}
                                    onAction={() => onDelete(user.id)}
                                    ariaLabel='Delete User'
                                    icon={TrashIcon}
                                    variant='ghost'
                                    loading={deletingId === user.id && isDeleting}
                                    isIconOnly
                                />
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            No results.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}