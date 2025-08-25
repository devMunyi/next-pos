import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";

export const getApiSettingsForUserAndProviderQuery = db
  .select()
  .from(userAISettings)
  .where(
    and(
      eq(userAISettings.userId, sql.placeholder("userId")),
      eq(userAISettings.provider, sql.placeholder("provider")),
    ),
  )
  .limit(1)
  .prepare("getApiSettingsForUserAndProvider");
