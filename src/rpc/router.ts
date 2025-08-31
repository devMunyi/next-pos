import "server-only";

import { ai } from "@/zap/rpc/procedures/ai.rpc";
import { auth } from "@/zap/rpc/procedures/auth.rpc";
import { categories } from "@/zap/rpc/procedures/categories.rpc";
import { dashboard } from "@/zap/rpc/procedures/dashboard.rpc";
import { example } from "@/zap/rpc/procedures/example.rpc";
import { feedbacks } from "@/zap/rpc/procedures/feedbacks.rpc";
import { mails } from "@/zap/rpc/procedures/mails.rpc";
import { orders } from "@/zap/rpc/procedures/orders.rpc";
import { products } from "@/zap/rpc/procedures/products.rpc";
import { units } from "@/zap/rpc/procedures/units.rpc";
import { users } from "@/zap/rpc/procedures/users.rpc";
import { waitlist } from "@/zap/rpc/procedures/waitlist.rpc";

export const router = {
  ai,
  auth,
  example,
  feedbacks,
  mails,
  users,
  waitlist,
  categories,
  units,
  products,
  orders,
  dashboard,
};
