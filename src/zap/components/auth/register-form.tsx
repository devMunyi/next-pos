"use client";

import { Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon,MailIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { Controller,useForm } from "react-hook-form";
import type { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ZapButton } from "@/components/zap-ui/button";
import { SETTINGS } from "@/data/settings";
import { cn } from "@/lib/utils";
// import { PolicyLinks } from "@/zap/components/auth/policy-links";
import { SocialProviders } from "@/zap/components/auth/social-providers";
import { useAuth } from "@/zap/hooks/auth/use-auth";
import { RegisterFormSchema } from "@/zap/schemas/auth.schema";

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { isInCooldown, cooldown, isSubmitting, handleRegisterSubmit } =
    useAuth();

  const {
    control,
    handleSubmit
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "CASHIER", // Default role
      password: "",
      confirmPassword: "",

    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          {SETTINGS.AUTH.ENABLE_SOCIAL_PROVIDER && (
            <CardDescription>
              Sign up with your Apple or Google account
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {SETTINGS.AUTH.ENABLE_SOCIAL_PROVIDER && (
              <>
                <SocialProviders
                  redirectURL={SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_UP}
                />
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit(handleRegisterSubmit)} className="grid gap-6">
              {/* Name Field */}
              <Controller
                name="name"
                control={control}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <Input
                    endContent={<UserIcon className="text-2xl text-default-400 pointer-events-none" />}
                    ref={ref}
                    label="Name"
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    isInvalid={invalid}
                    errorMessage={error?.message}
                    validationBehavior="aria"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                )}
              />

              {/* Email Field */}
              <Controller
                name="email"
                control={control}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <Input
                    endContent={<MailIcon className="text-2xl text-default-400 pointer-events-none" />}
                    ref={ref}
                    label="Email"
                    type="email"
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    isInvalid={invalid}
                    errorMessage={error?.message}
                    validationBehavior="aria"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                )}
              />

              {/* Password Field */}
              <Controller
                name="password"
                control={control}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <Input
                    endContent={<LockIcon className="text-2xl text-default-400 pointer-events-none" />}
                    ref={ref}
                    label="Password"
                    type="password"
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    isInvalid={invalid}
                    errorMessage={error?.message}
                    validationBehavior="aria"
                    placeholder="*********"
                    autoComplete="new-password"
                  />
                )}
              />

              {/* Confirm Password Field */}
              <Controller
                name="confirmPassword"
                control={control}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <Input
                    endContent={<LockIcon className="text-2xl text-default-400 pointer-events-none" />}
                    ref={ref}
                    label="Confirm Password"
                    type="password"
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    isInvalid={invalid}
                    errorMessage={error?.message}
                    validationBehavior="aria"
                    placeholder="*********"
                    autoComplete="new-password"
                  />
                )}
              />

              <ZapButton
                type="submit"
                className="w-full"
                disabled={isInCooldown}
                loading={isSubmitting}
              >
                {!isInCooldown ? "Create account" : `Please wait ${cooldown}s`}
              </ZapButton>
            </form>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Log in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* <PolicyLinks /> */}
    </div>
  );
}