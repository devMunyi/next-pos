import { z } from "zod";

const ClientEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  VERCEL_ENV: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z
    .string({ message: "NEXT_PUBLIC_VAPID_PUBLIC_KEY must be a valid string" })
    .optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z
    .string({ message: "NEXT_PUBLIC_POSTHOG_KEY must be a valid string" })
    .optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z
    .string({ message: "NEXT_PUBLIC_POSTHOG_HOST must be a valid string" })
    .optional(),
  ZAP_MAIL: z
    .string()
    .email({ message: "ZAP_MAIL must be a valid email address" })
    .optional(),
  COUNTRY_CODE: z.string().default("254"), // Default to Kenya
});

const CLIENT_ENV = ClientEnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  ZAP_MAIL: process.env.ZAP_MAIL,
  COUNTRY_CODE: process.env.COUNTRY_CODE,
});

if (!CLIENT_ENV.success) {
  const formattedErrors = CLIENT_ENV.error.issues.map((issue) => {
    const { path, message } = issue;
    return `  - ${path.join(".")}: ${message}`;
  });

  const errorMessage = [
    "Invalid client environment variables:",
    ...formattedErrors,
    "\nPlease check your client-side environment configuration (e.g., .env.local or Next.js environment variables) and ensure all required variables are set correctly.",
  ].join("\n");

  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const ENV = CLIENT_ENV.data;

// Derived values
export const VERCEL = !!ENV.VERCEL_ENV;
export const DEV = ENV.NODE_ENV !== "production";
