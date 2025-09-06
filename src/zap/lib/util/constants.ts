import { FormField } from "@/components/add-edit-form";
import { addUserSchema, updateUserSchema } from "@/zap/schemas/auth.schema";
import { createUnitSchema } from "@/zap/schemas/unit.schema";
export type commonStatus = 'ACTIVE' | 'INACTIVE';

export const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export const unitFormFields: FormField<typeof createUnitSchema>[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
  },
  {
    name: "acronym",
    label: "Acronym",
    type: "text",
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: statusOptions,
  },
];


export const addUserFormFields: FormField<typeof addUserSchema>[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
  },
  {
    name: "email",
    label: "Email",
    type: "text",
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'ADMIN', label: 'Admin' },
      { value: 'CASHIER', label: 'Cashier' },
    ]
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
  },
];

export const editUserFormFields: FormField<typeof updateUserSchema>[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
  },
  {
    name: "email",
    label: "Email",
    type: "text",
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'ADMIN', label: 'Admin' },
      { value: 'CASHIER', label: 'Cashier' },
    ]
  },
  // {
  //   name: 'password',
  //   label: 'Password',
  //   type: 'password',
  //   // optional: true, // Password is optional for editing
  // },
];



export const PAGE_SIZE_OPTIONS = [
  // { key: "5", label: "5" },
  { key: "10", label: "10" },
  { key: "20", label: "20" },
  { key: "50", label: "50" },
];

export const DEFAULT_PAGE_SIZE = Number(PAGE_SIZE_OPTIONS[0].key);