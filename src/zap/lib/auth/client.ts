import "client-only";

import {
  adminClient,
  anonymousClient,
  inferAdditionalFields,
  organizationClient,
  // passkeyClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { BASE_URL } from "@/zap.config";

import { auth } from "./server";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [
    twoFactorClient(),
    usernameClient(),
    anonymousClient(),
    // passkeyClient(),
    adminClient(),
    organizationClient(),
    inferAdditionalFields<typeof auth>()
  ],
});

export type Session = typeof authClient.$Infer.Session;
