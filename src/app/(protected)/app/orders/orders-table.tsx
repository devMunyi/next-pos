// src/app/(protected)/app/orders/orders-table.tsx
"use client";
import { Skeleton } from '@heroui/react';
import { PrinterIcon, TrashIcon } from 'lucide-react';
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
import { fancyDate } from '@/zap/lib/util/date.util';
import { Order } from '@/zap/types/infer-rpc';

export function OrdersTable({
    orders,
    isLoading,
    isDeleting,
    onPrint,
    onDelete,
    // onView,
    rpp, // rows per page
}: {
    orders: Order[];
    isLoading: boolean;
    isDeleting: boolean;
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
                                {new Date(order.createdAt).toLocaleDateString()}
                                <br />
                                <Badge color='primary' className='text-green-500'>{fancyDate(order.createdAt)}</Badge>
                            </TableCell>
                            <TableCell>
                                {order.saleType === 'CREDIT' ? (
                                    <Badge variant="destructive">
                                        {order.creditDueDate ? new Date(order.creditDueDate).toLocaleDateString() : 'N/A'}
                                    </Badge>
                                ) : (
                                    <Badge variant="default">Cash</Badge>
                                )}
                            </TableCell>

                            <TableCell className="flex space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onPrint(order)}
                                >
                                    <PrinterIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(order.id)}
                                    disabled={isDeleting}
                                >
                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                </Button>
                                {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onView(order.id)}
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