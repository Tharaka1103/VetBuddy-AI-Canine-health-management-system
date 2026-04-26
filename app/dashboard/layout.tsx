"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Separator } from "@/components/ui/separator";
import { GoogleMapsProvider } from "@/components/google-maps-provider";
import { LocationProvider } from "@/components/location-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTrainingHub = /\/dashboard\/[^/]+\/training/.test(pathname);

  // Training hub has its own sidebar — skip the dashboard shell
  if (isTrainingHub) {
    return (
      <LocationProvider>
        <GoogleMapsProvider>{children}</GoogleMapsProvider>
      </LocationProvider>
    );
  }

  return (
    <LocationProvider>
      <GoogleMapsProvider>
        <SidebarProvider>
          <DashboardSidebar />
          <SidebarInset>
            {/* Top bar with sidebar trigger */}
            <header className="flex h-14 items-center gap-2 border-b border-border px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <span className="text-sm font-medium text-muted-foreground">
                Dashboard
              </span>
            </header>
            <div className="flex-1">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </GoogleMapsProvider>
    </LocationProvider>
  );
}
