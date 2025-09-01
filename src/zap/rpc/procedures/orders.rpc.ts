import "server-only";

import { and, asc, desc, eq, ilike, or, SQL, sql } from "drizzle-orm";
import { z } from "zod";

import { invoice, invoiceDetails, product, stockHistory, user } from "@/db/schema";
import { authMiddleware, base } from "@/rpc/middlewares";
import { createOrderSchema, listOrdersSchema } from "@/zap/schemas/orders.schema";

export const orders = {
  // Create order procedure
  createOrder: base
    .use(authMiddleware)
    .input(createOrderSchema)
    .handler(async ({ context: { session, db }, input }) => {
      try {
        const userId = session.user.id;

        return await db.transaction(async (tx) => {
          // 1. Fetch product details
          const products = await tx
            .select({
              id: product.id,
              name: product.name,
              code: product.code,
              sellingPrice: product.sellingPrice,
              purchasePrice: product.purchasePrice,
              availableStock: product.availableStock,
              unitId: product.unitId,
            })
            .from(product)
            .where(sql`${product.id} IN ${input.items.map(item => item.productId)}`)
            .execute();

          if (products.length !== input.items.length) {
            throw new Error("Some products not found");
          }

          // 2. Validate stock availability
          for (const item of input.items) {
            const p = products.find(prod => prod.id === item.productId);
            if (!p) continue;

            if (p.availableStock < item.quantity) {
              throw new Error(`Insufficient stock for product ${p.name}`);
            }
          }

          // 3. Calculate totals and profit
          let invoiceTotal = 0;
          let invoiceProfit = 0;

          const itemsWithDetails = input.items.map(item => {
            const p = products.find(prod => prod.id === item.productId)!;
            const perUnitPrice = Number(p.sellingPrice);
            const totalPrice = perUnitPrice * item.quantity;
            const profit = (perUnitPrice - Number(p.purchasePrice)) * item.quantity;

            invoiceTotal += totalPrice;
            invoiceProfit += profit;

            return {
              ...item,
              product: p,
              perUnitPrice: perUnitPrice.toString(),
              totalPrice: totalPrice.toString(),
              itemProfit: profit.toString(),
            };
          });

          // 4. Create invoice (validations)
          if (input.saleType === "CASH" && input.paidAmount < invoiceTotal) {
            throw new Error("Paid amount cannot be less than total amount for cash sales");
          }

          if (input.saleType === "CREDIT" && input.paidAmount >= invoiceTotal) {
            throw new Error("Paid amount must be less than total amount for credit sales");
          }

          const cashBalance = input.saleType === "CASH" ? input.paidAmount - invoiceTotal : 0;
          const creditBalance = input.saleType === "CREDIT" ? input.paidAmount - invoiceTotal : 0;

          const [newInvoice] = await tx
            .insert(invoice)
            .values({
              cashierId: userId,
              saleType: input.saleType,
              totalAmount: invoiceTotal.toString(),
              paidAmount: input.paidAmount.toString(),
              saleProfit: invoiceProfit.toString(),
              cashBalance: cashBalance.toString(),
              creditBalance: creditBalance.toString(),
              creditDueDate: input.saleType === "CREDIT" ? input.creditDueDate : undefined,
              customerPhoneNumber: input.customerPhoneNumber,
              status: input.saleType === "CASH" ? "PAID" : "UNPAID",
              createdBy: userId,
            })
            .returning();

          // 5. Create invoice details and update product stock
          await Promise.all([
            // Insert invoice details for each item
            ...itemsWithDetails.map(item =>
              tx.insert(invoiceDetails).values({
                invoiceId: newInvoice.id,
                productId: item.productId,
                userId: userId,
                quantity: item.quantity,
                perUnitPrice: item.perUnitPrice,
                totalPrice: item.totalPrice,
                saleType: input.saleType,
                createdBy: userId,
              })
            ),
            // Update product stock for each item
            ...input.items.map(item =>
              tx.update(product)
                .set({
                  availableStock: sql`${product.availableStock} - ${item.quantity}`,
                  updatedAt: new Date().toISOString(),
                })
                .where(eq(product.id, item.productId))
            ),
            // Store stock history for each product
            ...itemsWithDetails.map(item =>
              tx.insert(stockHistory).values({
                product_id: item.productId,
                previous_stock: item.product.availableStock.toString(),
                new_stock: (item.product.availableStock - item.quantity).toString(),
                change_amount: (-item.quantity).toString(),
                changed_by: userId,
                change_reason: `${input.saleType} SALE`,
                status: "ACTIVE",
              })
            ),
          ]);

          return {
            success: true,
            data: {
              invoice: newInvoice,
              items: itemsWithDetails,
            },
            message: "Order created successfully",
          };
        });
      } catch (e) {
        console.error("Error creating order:", e);
        const errorMessage = e instanceof Error ? e.message : "Failed to create order";
        return { success: false, error: errorMessage, message: errorMessage };
      }
    }),

  // List orders procedure
  listOrders: base
    .use(authMiddleware)
    .input(listOrdersSchema)
    .handler(async ({ context: { db }, input }) => {
      try {
        const searchTerm = input.search?.trim();

        // filter
        let whereClause: SQL | undefined = undefined;
        if (searchTerm) {
          whereClause = and(
            ilike(invoice.saleType, `%${searchTerm}%`),
            or(
              ilike(user.name, `%${searchTerm}%`),
              ilike(user.email, `%${searchTerm}%`)
            )
          );
        }

        const [orders, total] = await Promise.all([
          db
            .select({
              id: invoice.id,
              servedBy: {
                id: user.id,
                name: user.name,
              },
              createdAt: invoice.createdAt,
              saleAmount: invoice.totalAmount,
              saleType: invoice.saleType,
              creditDueDate: invoice.creditDueDate,
            })
            .from(invoice)
            .leftJoin(user, eq(invoice.cashierId, user.id))
            .where(whereClause)
            .orderBy(
              input.sortOrder === "desc"
                ? desc(invoice[input.sortBy])
                : asc(invoice[input.sortBy])
            )
            .limit(input.pageSize || 10)
            .offset(((input.page ?? 1) - 1) * (input.pageSize || 10))
            .execute(),

          db
            .select({ count: sql<number>`count(*)` })
            .from(invoice)
            .leftJoin(user, eq(invoice.cashierId, user.id))
            .where(whereClause)
            .then((res) => res[0]?.count || 0),
        ]);

        return { orders, total };
      } catch (e) {
        console.error("Error fetching orders:", e);
        throw new Error(e instanceof Error ? e.message : "Failed to get orders");
      }
    }),

  // Get order by ID
  getOrderById: base
    .use(authMiddleware)
    .input(z.object({ id: z.string().min(1, "Order ID is required") }))
    .handler(async ({ context: { db }, input }) => {
      try {
        const transactionData = await db
          .select()
          .from(invoice)
          .where(eq(invoice.id, input.id!))
          .execute()
          .then((res) => res[0]);

        if (!transactionData) {
          throw new Error("Transaction not found");
        }

        return transactionData;
      } catch (e) {
        console.error("Error fetching order by ID:", e);
        throw new Error(e instanceof Error ? e.message : "Failed to get transaction by ID");
      }
    }),

  // Delete order
  deleteOrder: base
    .use(authMiddleware)
    .input(z.object({ id: z.string().min(1, "Order ID is required") }))
    .handler(async ({ context: { db }, input }) => {
      try {
        await db.delete(invoice).where(eq(invoice.id, input.id!)).execute();
        return { success: true };
      } catch (e) {
        console.error("Error deleting order:", e);
        throw new Error(e instanceof Error ? e.message : "Failed to delete order");
      }
    }),
};
