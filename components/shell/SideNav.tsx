"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PenSquare,
  Telescope,
  Rss,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type Item = { href: string; label: string; icon: LucideIcon };

const ITEMS: Item[] = [
  { href: "/studio", label: "Studio", icon: PenSquare },
  { href: "/research", label: "Research", icon: Telescope },
  { href: "/sources", label: "Sources", icon: Rss },
  { href: "/library", label: "Library", icon: BookOpen },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r-0">
      <SidebarHeader className="h-14 flex-row items-center justify-center border-b border-sidebar-border">
        <Link
          href="/studio"
          title="What About AI · Studio"
          className="font-mono text-[10px] uppercase tracking-mono text-sidebar-foreground"
        >
          <span className="group-data-[collapsible=icon]:hidden">
            What About AI
          </span>
          <span className="hidden group-data-[collapsible=icon]:inline">
            WAA
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITEMS.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="items-center border-t border-sidebar-border py-3">
        <span className="font-mono text-[9px] uppercase tracking-mono text-sidebar-foreground/50">
          v0.1 · internal
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}
