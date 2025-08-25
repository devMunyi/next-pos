// src/app/(protected)/app/units/unit-table.tsx
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
import { ReadUnitInput } from '@/zap/schemas/unit.schema';

export function UnitTable({
    units,
    isLoading,
    isDeleting,
    onEdit,
    onDelete,
    rpp, // rows per page
}: {
    units: ReadUnitInput[];
    isLoading: boolean;
    isDeleting: boolean;
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
                                {new Date(unit.createdAt).toLocaleDateString()}
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(unit)}
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(unit.id)}
                                    disabled={isDeleting}
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