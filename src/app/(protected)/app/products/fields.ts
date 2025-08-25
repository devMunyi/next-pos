// src/app/(protected)/app/products/stock-fields.ts
import { FormField } from "@/components/add-edit-form";
import { createOrderSchemaPermissive } from "@/zap/schemas/orders.schema";
import { updateStockSchema } from "@/zap/schemas/product.schema";


export const saleTypeOptions = [
    { value: "CASH", label: "Cash" },
    { value: "CREDIT", label: "Credit" },
];

export const checkoutFields: FormField<typeof createOrderSchemaPermissive>[] = [
    {
        name: "saleType",
        label: "Sale Type",
        type: "select",
        options: saleTypeOptions,
    },
    {
        name: "customerPhoneNumber",
        label: "Customer Phone Number",
        type: "text",
    },
    {
        name: "creditDueDate",
        label: "Credit Due Date",
        type: "date",
    },
    {
        name: "paidAmount",
        label: "Paid Amount",
        type: "number",
    },
];


export const stockFields: FormField<typeof updateStockSchema>[] = [
    {
        name: "availableStock",
        label: "Available Stock",
        type: "number",
    },
];

