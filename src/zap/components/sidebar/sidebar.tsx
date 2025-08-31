"use client";

import { ArchiveIcon, ChartLineIcon, CreditCardIcon, DollarSignIcon, Home, ListTreeIcon, ScaleIcon, ShoppingCartIcon, UsersIcon, WalletIcon } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarMainSection } from "@/zap/components/sidebar/sidebar-main-section";
import { SidebarSecondarySection } from "@/zap/components/sidebar/sidebar-secondary-section";
import { SidebarUser } from "@/zap/components/sidebar/sidebar-user";
import { authClient } from "@/zap/lib/auth/client";

const MAIN_NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
  },

  {
    title: "Category",
    url: "/app/category",
    icon: ListTreeIcon,
  },
  {
    title: "Units",
    url: "/app/units",
    icon: ScaleIcon,
  },
  {
    title: "Products",
    url: "/app/products",
    icon: ArchiveIcon,
  },
  {
    title: "Users",
    url: "/app/users",
    icon: UsersIcon,
  },
  {
    title: "Orders",
    url: "/app/orders",
    icon: ShoppingCartIcon,
  },
  {
    title: "Credit",
    url: "#",
    icon: WalletIcon, // general credit section
    items: [
      {
        title: "Repayments",
        url: "/app/credit/repayments",
        icon: DollarSignIcon, // repayment-related
      },
      {
        title: "Limits",
        url: "/app/credit/limits",
        icon: CreditCardIcon, // represents credit facility
      },
    ],
  },
  {
    title: "Reports",
    url: "/app/reports",
    icon: ChartLineIcon,
  }
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar> & {
  onLinkClick?: () => void;
}) {
  const { data } = authClient.useSession();
  const { onLinkClick, ...rest } = props;

  if (!data?.user) return null;

  const { email, name, image } = data.user;
  const userData = { email, name, avatar: image ?? null };

  return (
    <Sidebar variant="inset" {...rest}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/app" onClick={onLinkClick}>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">E-Shop ⚡️</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMainSection
          items={MAIN_NAV_ITEMS}
          onLinkClick={onLinkClick}
        // currentPath={pathname}
        />
        <SidebarSecondarySection className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        {/* <ModeToggle variant={"outline"} /> */}
        <SidebarUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}