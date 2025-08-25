import { useMemo } from 'react';

import { FormField } from "@/components/add-edit-form";
import { statusOptions } from '@/zap/lib/util/constants';
import { createProductSchema } from "@/zap/schemas/product.schema";
import { AllCategories, AllUnits } from "@/zap/types/infer-rpc";

export const useProductFormFields = (
    isEditing: boolean,
    allUnits: AllUnits['units'],
    allUnitsLoading: boolean,
    allCategories: AllCategories['categories'],
    allCategoriesLoading: boolean
): FormField<typeof createProductSchema>[] => {
    return useMemo(() => [
        {
            name: "code",
            label: "Code",
            type: "text",
            disabled: isEditing,
        },
        {
            name: 'name',
            label: 'Name',
            type: 'text',
        },
        {
            name: "unitId",
            label: "Unit",
            type: "select",
            options: allUnits.map(unit => ({
                value: unit.id,
                label: unit.name,
            })),
            disabled: allUnitsLoading
        },
        {
            name: "categoryId",
            label: "Category",
            type: "select",
            options: allCategories
                .map(item => ({
                    value: item.id,
                    label: item.name,
                })),
            disabled: allCategoriesLoading
        },
        {
            name: 'purchasePrice',
            label: 'Purchase Price',
            type: 'number',
        },
        {
            name: 'sellingPrice',
            label: 'Selling Price',
            type: 'number',
        },
        {
            name: 'availableStock',
            label: 'Available Stock',
            type: 'number',
        },
        {
            name: 'minimumStock',
            label: 'Minimum Stock',
            type: 'number',
        },
        {
            name: 'description',
            label: 'Description',
            type: 'textarea',
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: statusOptions,
        },
    ], [isEditing, allUnits, allUnitsLoading, allCategories, allCategoriesLoading]);
};