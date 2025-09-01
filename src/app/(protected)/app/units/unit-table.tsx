// src/app/(protected)/app/units/unit-table.tsx
"use client";
import { Skeleton } from '@heroui/react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import React from 'react';

import { ActionButton } from '@/components/actionButton';
import { DateDisplay } from '@/components/date-display';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ReadUnitInput } from '@/zap/schemas/unit.schema';

export function UnitTable({
    units,
    isLoading,
    isDeleting,
    deletingId,
    onEdit,
    onDelete,
    rpp, // rows per page
}: {
    units: ReadUnitInput[];
    isLoading: boolean;
    isDeleting: boolean;
    deletingId: string | null;
    onEdit: (unit: ReadUnitInput) => void;
    onDelete: (id: string) => void;
    onView: (unit: ReadUnitInput) => void;
    rpp: number; // optional prop for rows per page
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Acronym</TableHead>
                    {/* <TableHead>Description</TableHead> */}
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
                            {/* <TableCell><Skeleton className="h-4 w-[100px] rounded-lg" /></TableCell> */}
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
                ) : units.length > 0 ? (
                    units.map((unit, index) => (
                        <TableRow key={unit.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{unit.name}</TableCell>
                            <TableCell>{unit.acronym}</TableCell>
                            {/* <TableCell>{unit.description}</TableCell> */}
                            <TableCell>
                                <DateDisplay date={unit.createdAt} />
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        unit.status === 'ACTIVE' ? 'default' : 'secondary'
                                    }
                                >
                                    {unit.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="flex space-x-2">
                                {/* Edit Unit */}
                                <ActionButton
                                    onAction={() => onEdit(unit)}
                                    ariaLabel='Edit Unit'
                                    icon={PencilIcon}
                                    variant='ghost'
                                    isIconOnly
                                />

                                {/* Delete Unit */}
                                <ActionButton
                                    id={unit.id}
                                    onAction={() => onDelete(unit.id)}
                                    ariaLabel='Delete Unit'
                                    icon={TrashIcon}
                                    variant='ghost'
                                    isIconOnly
                                    loading={deletingId === unit.id && isDeleting}
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