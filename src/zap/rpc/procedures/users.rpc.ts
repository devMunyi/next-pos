// src/zap/rpc/procedures/users.rpc.ts
import "server-only";

import { asc, desc, eq, ilike, sql } from "drizzle-orm";
import z from "zod/v4";

import { account, user } from "@/db/schema";
import { authMiddleware, base } from "@/rpc/middlewares";
import { getUserIdFromMailQuery } from "@/zap/db/queries/emails.query";
import { auth } from "@/zap/lib/auth/server";
import { getStringDate } from "@/zap/lib/util/date.util";
import { updateUserSchema } from "@/zap/schemas/auth.schema";
import { listUsersSchema } from "@/zap/schemas/users.schema";

export const users = {
  listUsers: base
    .use(authMiddleware)
    .input(listUsersSchema)
    .handler(async ({ context: { db }, input }) => {
      try {
        const searchTerm = input.search?.trim();
        const filter = searchTerm ? ilike(user.name, `%${searchTerm}%`) : undefined;

        const [usersData, total] = await Promise.all([
          db.select({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            banned: user.banned,
          })
            .from(user)
            .where(filter)
            .orderBy(
              input.sortOrder === "asc"
                ? asc(user[input.sortBy])
                : desc(user[input.sortBy])
            )
            .limit(input.pageSize || 10)
            .offset(((input.page ?? 1) - 1) * (input.pageSize || 10)),

          db.select({ count: sql<number>`count(*)` })
            .from(user)
            .where(filter)
            .then((res) => res[0]?.count || 0),
        ]);

        return { success: true, data: { users: usersData, total } };
      } catch (e) {
        return {
          success: false,
          message: e instanceof Error ? e.message : "Failed to get users",
          data: { users: [], total: 0 },
        };
      }
    }),

  updateUser: base
    .use(authMiddleware)
    .input(updateUserSchema)
    .handler(async ({ context: { session, db }, input }) => {
      try {
        const { id: userId, role } = session.user;

        console.log({ input, userId, role });

        if (!userId) {
          return { success: false, message: "Session invalid. Please re-login." };
        }

        if (role !== "ADMIN") {
          return { success: false, message: "You don't have permission to update user!" };
        }

        const response = await db
          .update(user)
          .set({
            name: input.name,
            email: input.email,
            role: input.role,
            updatedAt: getStringDate(),
          })
          .where(eq(user.id, String(input.id)));

        console.log({ response })

        if (input.password) {
          const ctx = await auth.$context;
          const hash = await ctx.password.hash(input.password);

          await db
            .update(account)
            .set({ password: hash })
            .where(eq(account.userId, userId));
        }

        // // check if logged user is updating their own account, then invalidate session
        // if (userId === input.id) {
        //   // refresh session
        //   // const newSession = await auth.api.revokeUserSessions({ body: { userId } });
        //   // console.log({ newSession });
        // }

        return { success: true, message: "User updated successfully" };
      } catch (e) {

        console.log({ e });

        return {
          success: false,
          message: e instanceof Error ? e.message : "Failed to update user",
        };
      }
    }),

  getUserById: base
    .use(authMiddleware)
    .input(z.object({ id: z.string().min(1, "User ID is required") }))
    .handler(async ({ context: { db }, input }) => {
      try {
        const userData = await db
          .select()
          .from(user)
          .where(eq(user.id, input.id))
          .then((res) => res[0]);

        if (!userData) {
          return { success: false, message: "User not found" };
        }

        return { success: true, data: userData };
      } catch (e) {
        return {
          success: false,
          message: e instanceof Error ? e.message : "Failed to get user by ID",
        };
      }
    }),

  deleteUser: base
    .use(authMiddleware)
    .input(z.object({ id: z.string().min(1, "User ID is required") }))
    .handler(async ({ context: { db }, input }) => {
      try {
        await db.delete(user).where(eq(user.id, input.id));
        return { success: true, message: "User deleted successfully" };
      } catch (e) {
        return {
          success: false,
          message: e instanceof Error ? e.message : "Failed to delete user",
        };
      }
    }),

  getNumberOfUsers: base.use(authMiddleware).handler(async ({ context: { db } }) => {
    try {
      const numberOfUsers = await db.$count(user);
      return { success: true, data: { count: numberOfUsers } };
    } catch {
      return { success: false, message: "Failed to get number of users", data: { count: 0 } };
    }
  }),

  getUserIdFromMail: base
    .use(authMiddleware)
    .input(z.object({ email: z.string().email("Invalid email format") }))
    .handler(async ({ input }) => {
      try {
        const records = await getUserIdFromMailQuery.execute({ email: input.email });
        const record = records[0];

        if (!record) {
          return { success: false, message: "User not found" };
        }

        return { success: true, data: { userId: record.userId } };
      } catch (e) {
        return {
          success: false,
          message: e instanceof Error ? e.message : "Failed to get user ID from mail",
        };
      }
    }),
};
