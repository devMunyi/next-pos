"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface SidebarMainSectionProps {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: {
      title: string;
      url: string;
      icon?: LucideIcon;
    }[];
  }[];
  accordion?: boolean;
  onLinkClick?: () => void;
}

export function SidebarMainSection({ items, accordion = true, onLinkClick }: SidebarMainSectionProps) {
  const pathname = usePathname();

  const [openItem, setOpenItem] = React.useState<string | null>(
    items.find(
      (item) =>
        item.url === pathname || item.items?.some((sub) => sub.url === pathname)
    )?.title ?? null
  );

  const [openItems, setOpenItems] = React.useState<string[]>(() =>
    accordion
      ? []
      : items.filter((item) => item.items?.length).map((i) => i.title)
  );

  const handleToggle = (title: string, isOpen: boolean) => {
    if (accordion) {
      setOpenItem(isOpen ? title : null);
    } else {
      setOpenItems((prev) =>
        isOpen ? [...prev, title] : prev.filter((t) => t !== title)
      );
    }
  };

  const isOpen = (title: string) =>
    accordion ? openItem === title : openItems.includes(title);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isParentActive =
            pathname === item.url ||
            item.items?.some((sub) => pathname === sub.url);

          return item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen(item.title)}
              onOpenChange={(isOpen) => handleToggle(item.title, isOpen)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={isParentActive ? "font-semibold text-primary" : ""}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {accordion && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const isSubActive = pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={
                              isSubActive
                                ? "bg-accent text-primary font-semibold rounded-md"
                                : "text-muted-foreground"
                            }
                          >
                            <Link href={subItem.url} onClick={onLinkClick}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link
                  href={item.url}
                  onClick={() => {
                    if (accordion) setOpenItem(null);
                    onLinkClick?.();
                  }}
                  className={pathname === item.url ? "bg-accent text-primary font-semibold rounded-md" : ""}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
