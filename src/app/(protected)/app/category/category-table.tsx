// src/app/(protected)/app/category/category-table.tsx
"use client";
import { Skeleton } from '@heroui/react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader, 
    TableRow,
} from '@/components/ui/table';
import { ReadCategoryInput } from '@/zap/schemas/category.schema';

export function CategoryTable({
    categories,
    isLoading,
    isDeleting,
    onEdit,
    onDelete,
    // onView,
    rpp, // rows per page
}: {
    categories: ReadCategoryInput[];
    isLoading: boolean;
    isDeleting: boolean;
    onEdit: (category: ReadCategoryInput) => void;
    onDelete: (id: string) => void;
    // onView: (category: ReadCategoryInput) => void;
    rpp: number; // optional prop for rows per page
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    // Show loading skeletons
                    Array.from({ length: rpp }).map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                            <TableCell><Skeleton className="h-4 w-4 rounded-lg" /></TableCell>
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
                ) : categories.length > 0 ? (
                    categories.map((category, index) => (
                        <TableRow key={category.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>{category.description}</TableCell>
                            <TableCell>
                                {new Date(category.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        category.status === 'ACTIVE' ? 'default' : 'secondary'
                                    }
                                >
                                    {category.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="flex space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(category)}
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(category.id)}
                                    disabled={isDeleting}
                                >
                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                </Button>
                                {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onView(category.id)}
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