"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Effect } from "effect";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod/v4";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ZapButton } from "@/components/zap-ui/button";
import { SETTINGS } from "@/data/settings";
import { useCooldown } from "@/hooks/utils/use-cooldown";
import { authClient } from "@/zap/lib/auth/client";

const formSchema = z.object({
  email: z.email("Please enter a valid email address"),
});
type FormSchema = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const { cooldown, startCooldown, isInCooldown } = useCooldown(
    "forgot-password", // unique identifier for this cooldown
    SETTINGS.MAIL.RATE_LIMIT_SECONDS
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormSchema) => {
    setSubmitting(true);
    const { email } = values;

    await Effect.tryPromise({
      try: () =>
        authClient.forgetPassword({
          email,
          redirectTo: "/reset-password",
        }),
      catch: () => ({ error: true }),
    })
      .pipe(
        Effect.match({
          onSuccess: () => {
            toast.success("Check your email for the reset link!");
            startCooldown(SETTINGS.MAIL.RATE_LIMIT_SECONDS);
          },
          onFailure: () => {
            toast.error("An error occurred while sending the reset link.");
          },
        }),
      )
      .pipe(Effect.runPromise)
      .catch(() => {
        toast.error("An error occurred while sending the reset link.");
      });

    setSubmitting(false);
  };

  return (
    <div className="bg-muted/50 flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border shadow-none">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight">
            Forgot your password?
          </CardTitle>
          <CardDescription className="mt-2 text-center">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        type="email"
                        {...field}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ZapButton
                loading={submitting}
                disabled={isInCooldown}
                loadingText="Sending..."
                type="submit"
                className="w-full"
              >
                {!isInCooldown ? "Send reset link" : `Please wait ${cooldown}s`}
              </ZapButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
