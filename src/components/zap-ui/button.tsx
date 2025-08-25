"use client";
import "client-only";

import { Button } from "@heroui/react";

type ButtonProps = React.ComponentProps<typeof Button>;

type ZapButtonProps = ButtonProps & {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
};

export function ZapButton({
  children,
  loading,
  ...props
}: ZapButtonProps) {
  return <Button color="primary" isLoading={loading} {...props}>{loading ? "" : children}</Button>;
}
