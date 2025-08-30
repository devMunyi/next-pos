import { z } from "zod";

import { isPhoneValid, makePhoneValid } from "../lib/util/common.client.util";

// List/Filter Orders Schema
export const listOrdersSchema = z.object({
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().max(100).default(10),
    search: z.string().trim().optional(),
    sortBy: z.enum(["createdAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const paidAmountSchema = z.coerce.number().min(0, "Amount must be positive");


export const createOrderSchemaPermissive = z.object({
    saleType: z.enum(["CREDIT", "CASH"]),
    customerPhoneNumber: z.string().optional(),
    creditDueDate: z.string().optional(),
    items: z.array(
        z.object({
            productId: z.string(),
            quantity: z.number(),
        })
    ),
    paidAmount: paidAmountSchema,
})
    .refine((input) => {
        if (input.saleType === "CREDIT" && !input.creditDueDate) {
            return false;
        }
        return true;
    }, {
        message: "Credit due date is required for credit sales",
        path: ["creditDueDate"],
    })
    .refine((input) => {
        if (input.saleType === "CREDIT" && !input.customerPhoneNumber) {
            return false;
        }
        return true;
    }, {
        message: "Customer phone number is required for credit sales",
        path: ["customerPhoneNumber"],
    })
    .refine((input) => {
        // validate phone number for both sale types if provided
        if (input.customerPhoneNumber) {
            const validPhone = makePhoneValid(input.customerPhoneNumber);
            return isPhoneValid(validPhone);
        }
        return true;
    }, {
        message: "Invalid phone number format",
        path: ["customerPhoneNumber"],
    })
    .refine((input) => {
        if (input.saleType === "CASH" && input.paidAmount <= 0) {
            return false;
        }
        return true;
    }, {
        message: "Paid amount must be greater than 0 for cash sales",
        path: ["paidAmount"],
    });


export const createOrderSchema = z.object({
    saleType: z.enum(["CREDIT", "CASH"]),
    customerPhoneNumber: z.string()
        .optional()
        .transform((phone: string | undefined) => phone ? makePhoneValid(phone) : phone)
        .refine((phone: string | undefined) => {
            if (!phone) return true;
            return isPhoneValid(phone);
        }, {
            message: "Invalid phone number format",
        }),
    creditDueDate: z.string().optional(),
    items: z.array(
        z.object({
            productId: z.string().min(1, "Product ID is required"),
            quantity: z.number().int().positive({
                message: "Quantity must be a positive integer"
            }),
        })
    ).min(1, "At least one item is required"),
    paidAmount: paidAmountSchema
})
    .refine((input) => {
        if (input.saleType === "CREDIT" && !input.creditDueDate) {
            return false;
        }
        return true;
    }, {
        message: "Credit due date is required for credit sales",
        path: ["creditDueDate"],
    })
    .refine((input) => {
        if (input.saleType === "CREDIT" && !input.customerPhoneNumber) {
            return false;
        }
        return true;
    }, {
        message: "Customer phone number is required for credit sales",
        path: ["customerPhoneNumber"],
    })
    .refine((input) => {
        if (input.saleType === "CREDIT" && input.customerPhoneNumber && !isPhoneValid(input.customerPhoneNumber)) {
            return false;
        }
        return true;
    }, {
        message: "Valid phone number is required for credit sales",
        path: ["customerPhoneNumber"],
    });

// Type exports
export type ListOrdersInput = z.infer<typeof listOrdersSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;