// src/app/(protected)/app/orders/orders-table.tsx
"use client";
import { Skeleton } from '@heroui/react';
import { PrinterIcon, TrashIcon } from 'lucide-react';
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
import { Order } from '@/zap/types/infer-rpc';

export function OrdersTable({
    orders,
    isLoading,
    isDeleting,
    deletingId,
    onPrint,
    onDelete,
    // onView,
    rpp, // rows per page
}: {
    orders: Order[];
    isLoading: boolean;
    isDeleting: boolean;
    deletingId: string | null;
    onPrint: (order: Order) => void;
    onDelete: (id: string) => void;
    // onView: (order: Order) => void;
    rpp: number; // optional prop for rows per page
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Served By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Sale Type</TableHead>
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
                ) : orders.length > 0 ? (
                    orders.map((order, index) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{order.servedBy?.name}</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'KSH',
                                }).format(Number(order.saleAmount))}
                            </TableCell>
                            <TableCell>
                                <DateDisplay date={order.createdAt} />
                            </TableCell>
                            <TableCell>
                                {order.saleType === 'CREDIT' ? (
                                    <Badge variant="destructive">
                                        Credit
                                        <br />
                                        <span className="text-xs text-muted-foreground">
                                            Due: {order.creditDueDate ? <DateDisplay date={order.creditDueDate} /> : "N/A"}
                                        </span>
                                    </Badge>
                                ) : (
                                    <Badge variant="default">Cash</Badge>
                                )}
                            </TableCell>

                            <TableCell className="flex space-x-2">
                                {/* Print Order */}
                                <ActionButton
                                    id={order.id}
                                    onAction={() => onPrint(order)}
                                    ariaLabel='Print Order'
                                    icon={PrinterIcon}
                                    variant='ghost'
                                    isIconOnly
                                />

                                {/* Delete Order */}
                                <ActionButton
                                    id={order.id}
                                    onAction={() => onDelete(order.id)}
                                    ariaLabel='Delete Order'
                                    icon={TrashIcon}
                                    variant='ghost'
                                    isIconOnly
                                    loading={deletingId === order.id && isDeleting}
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