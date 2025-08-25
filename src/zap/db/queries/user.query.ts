import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";

import { user } from "../schema/auth.sql";

export const getUserById = async (id: string) => {
    const result = await db.select().from(user).where(eq(user.id, id)).limit(1).execute();
    return result[0];
};

export const getFirstUser = async () => {
    const result = await db.select().from(user).orderBy(user.createdAt).limit(1).execute();
    return result[0];
}