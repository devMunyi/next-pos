"use client";

import { Box, DollarSign,Package, ShoppingCart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardPage() {
  // Static data for the dashboard
  const lowStockProducts = 5;
  const totalProducts = 42;
  const todaysTransactions = 8;
  const todaysSales = 12500.75;

  // Sample data for best selling products
  const bestProducts = [
    {
      id: 1,
      code: "PROD001",
      name: "Premium Coffee Beans",
      quantity: 120,
      unit: "kg",
      total: 36000,
      profit: 12000,
    },
    {
      id: 2,
      code: "PROD002",
      name: "Organic Tea Leaves",
      quantity: 85,
      unit: "kg",
      total: 21250,
      profit: 6375,
    },
    {
      id: 3,
      code: "PROD003",
      name: "Chocolate Bars",
      quantity: 200,
      unit: "pcs",
      total: 15000,
      profit: 5000,
    },
    {
      id: 4,
      code: "PROD004",
      name: "Energy Drinks",
      quantity: 150,
      unit: "cans",
      total: 22500,
      profit: 7500,
    },
    {
      id: 5,
      code: "PROD005",
      name: "Bottled Water",
      quantity: 300,
      unit: "bottles",
      total: 9000,
      profit: 3000,
    },
  ];

  // Assume user is admin for this example
  const isAdmin = true;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Low Stock Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lowStockProducts > 0 ? (
              <div className="text-2xl font-bold">{lowStockProducts}</div>
            ) : (
              <p className="text-sm font-medium">There is no any</p>
            )}
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        {/* Today's Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{`Today's Transactions`}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysTransactions}</div>
          </CardContent>
        </Card>

        {/* Today's Sales Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{`Today's Sales Amount`}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ksh. {todaysSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Summary */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sale Summary In Last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Product Code</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Sold Quantity</TableHead>
                <TableHead>Sale Total</TableHead>
                {isAdmin && <TableHead>Sale Profit</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {product.quantity} <span>{product.unit}</span>
                  </TableCell>
                  <TableCell>
                    Ksh {product.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      Ksh {product.profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}