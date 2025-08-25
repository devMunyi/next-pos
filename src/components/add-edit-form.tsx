// src/components/add-edit-form.tsx
"use client";
import { Input, Select, SelectItem } from "@heroui/react";
import type { Path } from "react-hook-form";
import { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { z } from 'zod';

export type FormField<T extends z.ZodTypeAny> = {
  name: Path<z.infer<T> extends FieldValues ? FieldValues & z.infer<T> : FieldValues>;
  label: string;
  type: 'text' | 'select' | 'number' | 'textarea' | 'password' | 'email' | 'date'
  options?: { value: string; label: string }[];
  disabled?: boolean;
  isLoading?: boolean;
};

import type { FieldValues } from "react-hook-form";

type AddEditFormProps<T extends z.ZodTypeAny> = {
  form: UseFormReturn<z.infer<T> extends FieldValues ? z.infer<T> : FieldValues>; // Ensure type compatibility
  fields: FormField<T>[];
  columns?: {
    base?: number;       // mobile (default: 1)
    md?: number;        // medium screens (default: base or 1)
    lg?: number;        // large screens (default: md or base or 1)
  };
  gap?: number;         // gap between items (default: 4)
};

export function AddEditForm<T extends z.ZodTypeAny>({
  form,
  fields,
  columns = { base: 1, md: 2 },
  gap = 4,
}: AddEditFormProps<T>) {
  // Generate grid class based on columns prop
  const getGridClass = () => {
    const classes = [];
    if (columns.base) classes.push(`grid-cols-${columns.base}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    return classes.join(' ');
  };

  return (
    <form onSubmit={form.handleSubmit(() => { })} key={fields.map(f => f.name).join('-')}>
      <div className={`grid ${getGridClass()} gap-${gap}`}>
        {fields.map((field) => (
          <div key={field.name} className="space-y-4">
            <Controller
              name={field.name}
              control={form.control}
              render={({ field: controllerField, fieldState }) => {
                // Add this conversion for number inputs
                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  if (field.type === 'number') {
                    controllerField.onChange(e.target.valueAsNumber);
                  } else {
                    controllerField.onChange(e.target.value);
                  }
                };

                switch (field.type) {
                  case 'select':
                    return (
                      <Select
                        label={field.label}
                        selectedKeys={controllerField.value ? [controllerField.value] : []}
                        onSelectionChange={(keys) =>
                          controllerField.onChange(Array.from(keys)[0])
                        }
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        isDisabled={field.disabled || field.isLoading}
                      >
                        {(field.options ?? []).map((option) => (
                          <SelectItem key={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    );
                  default:
                    return (
                      <Input
                        {...controllerField}
                        label={field.label}
                        type={field.type}
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        isDisabled={field.disabled || field.isLoading}
                        // Add this onChange handler
                        onChange={handleChange}
                        // Ensure proper value type for number inputs
                        value={field.type === 'number'
                          ? String(controllerField.value ?? 0)
                          : controllerField.value
                        }
                      />
                    );
                }
              }}
            />
          </div>
        ))}
      </div>
      <button type="submit" className="hidden" />
    </form>
  );
}