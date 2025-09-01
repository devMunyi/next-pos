import { boolean, decimal, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import type { ModelName } from "@/zap/types/ai.types";
import { generateId } from "better-auth";

export const userAISettings = pgTable("user_ai_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  provider: text("provider").notNull(), // e.g. "openai", "mistral"
  model: text("model").$type<ModelName>().notNull(), // e.g. "gpt-4o-mini"
  encryptedApiKey: jsonb("encrypted_api_key")
    .$type<{
      iv: string;
      encrypted: string;
    }>()
    .notNull(), // Encrypted API key
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
  twoFactorEnabled: boolean("two_factor_enabled"),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  isAnonymous: boolean("is_anonymous"),
  role: text("role", { enum: ["ADMIN", "CASHIER"] }).notNull().default("CASHIER"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  lastEmailSentAt: timestamp("last_email_sent_at"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
  activeOrganizationId: text("active_organization_id"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const twoFactor = pgTable("two_factor", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const passkey = pgTable("passkey", {
  id: text("id").primaryKey(),
  name: text("name"),
  publicKey: text("public_key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  credentialID: text("credential_i_d").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type").notNull(),
  backedUp: boolean("backed_up").notNull(),
  transports: text("transports"),
  createdAt: timestamp("created_at"),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});


export const category = pgTable("categories", {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId())
    .notNull(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE"),
});


export const creditLimit = pgTable("credit_limit", {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId())
    .notNull(),
  customerId: text("customer_id").notNull().references(() => customer.id, {
    onDelete: "cascade"
  }),
  limitAmount: integer("limit_amount").notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null"
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE"),
});


export const creditRepayment = pgTable("credit-repayments", {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId())
    .notNull(),
  invoiceId: text("invoice_id").notNull().references(() => invoice.id, {
    onDelete: "cascade"
  }),
  addedBy: text("added_by").references(() => user.id, { onDelete: "set null" }),
  customerPhoneNumber: text("customer_phone_number"),
  amountPaid: integer("amount").notNull(),
  paymentDate: timestamp("payment_date", { mode: "string" }).defaultNow().notNull(),
  transactionCode: text("transaction_code").unique(),
  creditBalance: integer("credit_balance").notNull(),
  paymentMethod: text("payment_method", {
    enum: ["CASH", "MOBILE_MONEY", "BANK_TRANSFER"]
  }).notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null"
  }),
  createdAt: timestamp("created_at"
    , { mode: "string" }
  ).defaultNow().notNull(),
  updatedAt: timestamp("updated_at"
    , { mode: "string" }
  ),
  deletedAt: timestamp("deleted_at", { mode: "string" }),
  status: text("status", { enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED", "DELETED"] })
    .notNull()
    .default("COMPLETED")
});

export const customer = pgTable("customers", {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId())
    .notNull(),
  name: text("name").notNull(),
  email: text("email").unique(),
  phoneNumber: text("phone_number").notNull().unique(),
  nationalId: text("national_id").notNull().unique(),
  imgUrl: text("img_url"),
  address: text("address"),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null"
  }),
  createdAt: timestamp("created_at", {
    mode: "string"
  }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string"
  }),
  creditLimit: decimal("credit_limit").notNull().default("0"),
  creditBalance: decimal("credit_balance").notNull().default("0"),
  creditStatus: text("credit_status", { enum: ["ACTIVE", "INACTIVE"] })
    .notNull()
    .default("ACTIVE"),
  status: text("status", { enum: ["ACTIVE", "PENDING", "INACTIVE", "SUSPENDED"] }).notNull().default("ACTIVE"),
});

export const invoiceDetails = pgTable("invoice_details", {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId())
    .notNull(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoice.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull(), // Renamed from 'amount' to 'qty'
  perUnitPrice: decimal("per_unit_price", { precision: 20, scale: 2 }).notNull(), // New column
  totalPrice: decimal("total_price", { precision: 20, scale: 2 }).notNull(), // New column
  saleType: text("sale_type", { enum: ["CREDIT", "CASH"] }).notNull(), // New column
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(), // New column (renamed from created_at)
  updatedAt: timestamp("updated_at", { mode: "string" }), // New column (renamed from updated_at)
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null"
  }),
  status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE")
});


export const invoice = pgTable("invoices", {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId())
    .notNull(),
  cashierId: text("cashier_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  saleType: text("sale_type", { enum: ["CREDIT", "CASH"] }).notNull(),
  totalAmount: decimal("total_amount").notNull(),
  paidAmount: decimal("paid_amount").notNull(),
  saleProfit: decimal("sale_profit").default("0").notNull(),
  cashBalance: decimal("cash_balance").default("0").notNull(),
  creditBalance: decimal("credit_balance").default("0").notNull(),
  creditDueDate: timestamp("credit_due_date", { mode: "string" }),
  customerPhoneNumber: text("customer_phone_number"),
  status: text("status", {
    enum: ["PAID", "UNPAID", "PARTIALLY_PAID", "CANCELLED"]
  }).notNull().default("UNPAID"),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null"
  }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }),
});


export const product = pgTable("products", {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId())
    .notNull(),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: text("category_id").notNull().references(() => category.id, { onDelete: "cascade" }),
  purchasePrice: decimal("purchase_price", { precision: 20, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 20, scale: 2 }).notNull(),
  expectedProfit: decimal("expected_profit", { precision: 20, scale: 2 }).notNull().default("0"),
  availableStock: integer("available_stock").notNull().default(0),
  minimumStock: integer("minimum_stock").notNull().default(0),
  unitId: text("unit_id")
    .notNull()
    .references(() => unit.id, { onDelete: "cascade" }),
  imageUrl: text("image_url"),
  status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE"),
});

export const stockHistory = pgTable("stock_history", {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId())
    .notNull(),
  product_id: text("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  previous_stock: decimal("previous_stock").notNull(),
  new_stock: decimal("new_stock").notNull(),
  change_amount: decimal("change_amount").notNull(),
  changed_by: text("changed_by").references(() => user.id, { onDelete: "set null" }),
  change_reason: text("change_reason").notNull(),
  change_note: text("change_note"),
  change_date: timestamp("change_date", { mode: "string" }).defaultNow().notNull(),
  status: text("status", {
    enum: ["ACTIVE", "INACTIVE"]
  }).notNull().default("ACTIVE")
});


export const unit = pgTable("units", {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId())
    .notNull(),
  name: text("name").notNull(),
  acronym: text("acronym"),
  description: text("description"),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }),
  status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE")
});


export const expenses = pgTable("expenses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId())
    .notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
  expenseDate: timestamp("expense_date", { mode: "string" }).defaultNow().notNull(),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }),
});


/*

1) Disbursements Target
2) Active Loans Target
3) New Loans Target
4) Expected Collections and PAR



Disbursed Column
Expected and Collected (P+I)
Daily Collection
Current PAR rename to Overdue
Monthly allowed par 5% of expected total
surplus = default - allowed PAR
90%/collected - expected

*/