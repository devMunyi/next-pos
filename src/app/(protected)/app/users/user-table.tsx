// src/app/(protected)/app/units/unit-table.tsx
"use client";
import { Badge, Button, Skeleton } from '@heroui/react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import React from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { capitalizeString } from '@/zap/lib/util/common.util';
import { fancyDate } from '@/zap/lib/util/date.util';
import { User } from '@/zap/types/infer-rpc';

export function UserTable({
    users,
    isLoading,
    isDeleting,
    onEdit,
    onDelete,
    rpp, // rows per page
}: {
    users: User[];
    isLoading: boolean;
    isDeleting: boolean;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
    onView: (user: User) => void;
    rpp: number; // optional prop for rows per page
}) {
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
                                <Button
                                    variant="ghost"
                                    isIconOnly
                                    onPress={() => onEdit(user)}
                                    aria-label='Edit User' // Accessibility label
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    isIconOnly
                                    onPress={() => onDelete(user.id)}
                                    disabled={isDeleting}
                                    aria-label='Delete User' // Accessibility label
                                >
                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                </Button>
                                {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onView(unit.id)}
                                >
                                    <EyeIcon className="h-4 w-4 text-blue-500" />
                                </Button> */}
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