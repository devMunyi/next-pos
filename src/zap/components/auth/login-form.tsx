"use client";

import { Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, MailIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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
import { LoginFormSchema } from "@/zap/schemas/auth.schema";

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [callbackURL, setCallbackURL] = useState<string | null>(null);
  const { isInCooldown, cooldown, isSubmitting, handleLoginSubmit } =
    useAuth(callbackURL);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get("redirect");
    if (redirect) setCallbackURL(redirect);
  }, []);

  const {
    control,
    handleSubmit
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "samunyi91@gmail.com",
      password: "g_k8C_s2@ko$(w!^u(pL2l8_goI@t0k2w5_g",
    },
    reValidateMode: "onChange",
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          {SETTINGS.AUTH.ENABLE_SOCIAL_PROVIDER && (
            <CardDescription>
              Login with your Apple or Google account
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {SETTINGS.AUTH.ENABLE_SOCIAL_PROVIDER && (
              <>
                <SocialProviders
                  redirectURL={SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_IN}
                />
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit(handleLoginSubmit)} className="grid gap-6">
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
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-end">
                      {/* <label className="text-sm font-medium text-foreground">
                        Password
                      </label> */}
                      {/* <Link
                        href="/forgot-password"
                        className="text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link> */}
                    </div>
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
                      autoComplete="current-password"
                    />
                  </div>
                )}
              />

              <ZapButton
                type="submit"
                className="w-full"
                disabled={isInCooldown}
                loading={isSubmitting}
              >
                {!isInCooldown ? "Login" : `Please wait ${cooldown}s`}
              </ZapButton>
            </form>

            {/* <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Sign up
              </Link>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* <PolicyLinks /> */}
    </div>
  );
}