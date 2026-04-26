"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Zap,
  TrendingUp,
  Mic,
  Settings,
  ArrowLeft,
  LogOut,
  Brain,
} from "lucide-react";

export function TrainingSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { user, logout } = useAuth();
  const dogId = params.id as string;

  const basePath = `/dashboard/${dogId}/training`;

  const navItems = [
    {
      title: "Dashboard Overview",
      url: basePath,
      icon: LayoutDashboard,
    },
    {
      title: "Live Training Session",
      url: `${basePath}/live`,
      icon: Zap,
    },
    {
      title: "Progress Analytics",
      url: `${basePath}/progress`,
      icon: TrendingUp,
    },
    {
      title: "Bark Analysis History",
      url: `${basePath}/barks`,
      icon: Mic,
    },
    {
      title: "Settings",
      url: `${basePath}/settings`,
      icon: Settings,
    },
  ];

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ---- Header ---- */}
      <SidebarHeader className="p-4">
        <Link href={`/dashboard/${dogId}`} className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            Training Hub
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ---- Navigation ---- */}
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Training</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === basePath
                    ? pathname === basePath
                    : pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ---- Back link ---- */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Back to Health Dashboard">
                  <Link href={`/dashboard/${dogId}`}>
                    <ArrowLeft className="h-4 w-4" />
                    <span>Health Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="My Dogs">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>My Dogs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ---- Footer ---- */}
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col">
          <NotificationBell />
          <ThemeToggle />
        </div>
        <SidebarSeparator className="my-2" />
        <div className="flex flex-col gap-1 group-data-[collapsible=icon]:items-center">
          <p className="truncate text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {user?.name || user?.email}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
