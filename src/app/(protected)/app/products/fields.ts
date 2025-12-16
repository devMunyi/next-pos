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

export const stockReasonOptions = [
    { value: "NEW_STOCK", label: "New Stock Received" },
    { value: "CASH_SALE", label: "Cash Sale" },
    { value: "CREDIT_SALE", label: "Credit Sale" },
    { value: "SALES_ADJUSTMENT", label: "Sales Adjustment" },
    { value: "CUSTOMER_RETURN", label: "Customer Return" },
    { value: "DAMAGED_EXPIRED", label: "Damaged / Expired Items" },
    { value: "LOST_STOLEN", label: "Lost / Stolen Items" },
    { value: "STOCK_TRANSFER", label: "Stock Transfer" },
    { value: "INVENTORY_COUNT", label: "Inventory Count Adjustment" },
    { value: "PROMOTIONAL_USE", label: "Promotional Use / Free Sample" },
    { value: "BUNDLE_ADJUSTMENT", label: "Bundle / Unbundle Adjustment" },
    { value: "OTHER", label: "Other (Please specify)" },
];

// derive the map automatically
export const stockReasonMap = Object.fromEntries(
    stockReasonOptions.map(opt => [opt.value, opt.label])
) as Record<string, string>;


export const stockFields: FormField<typeof updateStockSchema>[] = [
    {
        name: "availableStock",
        label: "Available Stock",
        type: "number",
    },
    {
        name: "reason",
        label: "Reason for Update",
        type: "select",
        options: stockReasonOptions,
    },
    {
        name: "otherReason",
        label: "Specify Other Reason",
        type: "text",
        showIf: (values) => values.reason === "OTHER",
    },
];

