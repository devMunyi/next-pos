// src/zap/types/infer-rpc.ts
import type { InferRouterOutputs } from '@orpc/server'

import { router } from "@/rpc/router";
export type Outputs = InferRouterOutputs<typeof router>

// Extract the type of categories from the router outputs
export type Categories = Outputs['categories']['listCategories']
export type Category = Outputs['categories']['getCategoryById']
export type AllCategories = Outputs['categories']['getAllCategories'];


// // Extract the type of products from the router outputs
export type Products = Outputs['products']['listProducts']
export type Product = Products['data']['products'][number];
export type ProductById = Outputs['products']['getProductById']

// Extract the type of units from the router outputs
export type Units = Outputs['units']['listUnits']
export type Unit = Units['units'][number];
export type UnitById = Outputs['units']['getUnitById']
export type AllUnits = Outputs['units']['getAllUnits']

// Extract the type of users from the router outputs
export type Users = Outputs['users']['listUsers']
export type User = Users['data']['users'][number];
export type UserById = Outputs['users']['getUserById']

// Extract the type of orders from the router outputs
export type Orders = Outputs['orders']['listOrders']
export type Order = Orders['orders'][number];
export type OrderById = Outputs['orders']['getOrderById']

export type DashboardSummaryResponse = Outputs['dashboard']['getSummary']
export type DailyMetric = DashboardSummaryResponse['totalProducts'][number];
