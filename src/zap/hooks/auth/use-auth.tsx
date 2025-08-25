"use client";
import "client-only";

import { useRouter } from "@bprogress/next/app";
import { Effect } from "effect";
import { useState } from "react";
import toast from 'react-hot-toast';
import type { z } from "zod";

import { SETTINGS } from "@/data/settings";
import { useCooldown } from "@/hooks/utils/use-cooldown";
import { authClient } from "@/zap/lib/auth/client";
import { handleCompromisedPasswordError } from "@/zap/lib/auth/utils";
import type {
  LoginFormSchema,
  RegisterFormSchema,
} from "@/zap/schemas/auth.schema";

type LoginFormValues = z.infer<typeof LoginFormSchema>;
type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export function useAuth(callbackURL?: string | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  const { cooldown, startCooldown, isInCooldown } = useCooldown(
    "auth-verification", // searchTerm or unique identifier
    SETTINGS.MAIL.RATE_LIMIT_SECONDS, // initial cooldown duration
  );

  const sendVerificationMail = async (email: string, callbackURL: string) => {
    const effect = Effect.tryPromise({
      try: () => authClient.sendVerificationEmail({ email, callbackURL }),
      catch: () => new Error("Failed to send verification email"),
    }).pipe(
      Effect.tap(() =>
        Effect.sync(() => startCooldown(SETTINGS.MAIL.RATE_LIMIT_SECONDS)),
      ),
    );

    return await Effect.runPromise(effect);
  };

  const loginWithMail = async (
    values: LoginFormValues,
    callbackURL?: string | null,
  ) => {
    const { email, password } = values;
    const result = await Effect.tryPromise({
      try: () => authClient.signIn.email({ email, password }),
      catch: () => new Error("Failed to login"),
    })
      .pipe(
        Effect.match({
          onSuccess: async (response) => {
            if (response.error) {
              toast.error("Login failed. Please check your credentials.");
              return;
            }

            if (
              SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION &&
              !response.data?.user?.emailVerified
            ) {
              await sendVerificationMail(email, "/app");
              toast.error(
                "Please verify your email address. A verification email has been sent.",
              );
              return;
            }

            toast.success("Login successful!");
            router.push(
              callbackURL || SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_IN,
            );
          },
          onFailure: (e) => {
            toast.error("Login failed. Please check your credentials.");
            throw e;
          },
        }),
      )
      .pipe(Effect.runPromise);
    return result;
  };

  const registerWithMail = async (
    values: RegisterFormValues,
    callbackURL?: string | null,
  ) => {
    setIsRegistering(true);
    const { name, email, password, role } = values;
    const result = await Effect.tryPromise({
      try: () => authClient.signUp.email({ email, password, name, role }),
      catch: (e) => new Error(e instanceof Error ? e.message : "Failed to register"),
    })
      .pipe(
        Effect.match({
          onSuccess: async (response) => {
            if (response.error) {
              handleCompromisedPasswordError(response.error);
              return;
            }

            if (SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION) {
              await sendVerificationMail(email, "/login");
              toast.success(
                "Registration successful! Please check your email to verify your account.",
              );
            } else {
              toast.success("Registration successful!");
            }
            router.push(
              callbackURL || SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_UP,
            );
          },
          onFailure: (e) => {
            handleCompromisedPasswordError(e);
          },
        }),
      )
      .pipe(Effect.runPromise);

    setIsRegistering(false);
    return result;
  };

  const updatePassword = async ({
    currentPassword,
    newPassword,
    revokeOtherSessions = true,
  }: {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions?: boolean;
  }) => {

    const effect = Effect.gen(function* () {
      const result = yield* Effect.tryPromise(() =>
        authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions,
        })
      );

      if (result.data?.token) {
        toast.success("Password changed successfully");
        // yield* Effect.sync(() => router.push("/app"));
      } else {
        toast.error(`${result?.error?.message || "Failed to change password"}`);
      }
      return result;
    });
    return await Effect.runPromise(effect);

  };
  const withSubmitWrapper = async <T,>(
    action: () => Promise<T>,
  ): Promise<T | undefined> => {
    setIsSubmitting(true);

    const effect = Effect.tryPromise({
      try: () => action(),
      catch: () => new Error("Authentication failed"),
    }).pipe(
      Effect.tap(() => Effect.sync(() => setIsSubmitting(false))), // Reset on success
      Effect.tapError(() => Effect.sync(() => setIsSubmitting(false))), // Reset on error
      Effect.catchAll(() => Effect.sync(() => undefined)),
    );

    return await Effect.runPromise(effect);
  };

  const handleLoginSubmit = (values: LoginFormValues) =>
    withSubmitWrapper(() => loginWithMail(values, callbackURL));

  const handleRegisterSubmit = (values: RegisterFormValues) =>
    withSubmitWrapper(() => registerWithMail(values, callbackURL));

  return {
    loginWithMail,
    registerWithMail,
    isInCooldown,
    cooldown,
    handleLoginSubmit,
    handleRegisterSubmit,
    isSubmitting,
    updatePassword,
    isRegistering
  };
}
