"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useLocation } from "@/components/location-provider";
import { useFirebaseGPS } from "@/hooks/use-firebase-sensors";
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
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dog,
  LayoutDashboard,
  Bell,
  Settings,
  LogOut,
  Stethoscope,
  MapPin,
  LocateFixed,
  Loader2,
} from "lucide-react";

const navItems = [
  {
    title: "My Dogs",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Care Centers",
    url: "/dashboard/clinics",
    icon: Stethoscope,
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const {
    position,
    locationName,
    loading: locationLoading,
    error: locationError,
    accuracy,
    refreshLocation,
    isManual,
  } = useLocation();
  
  const firebaseGPS = useFirebaseGPS();

  console.log("[Sidebar] Firebase GPS data:", firebaseGPS);
  console.log("[Sidebar] Device position:", position);

  // Display Firebase error if any
  if (firebaseGPS.error) {
    console.error("[Sidebar] Firebase GPS Error:", firebaseGPS.error);
  }

  // Use belt GPS if available, belt is online, and has satellite fix with coordinates
  const hasValidBeltGPS = firebaseGPS.beltOnline && firebaseGPS.gpsFix && firebaseGPS.lat && firebaseGPS.lng;
  const displayPosition = hasValidBeltGPS
    ? { lat: firebaseGPS.lat, lng: firebaseGPS.lng }
    : position;
  
  const isBeltLocation = hasValidBeltGPS;
  const displayLocationName = isBeltLocation ? "Dog's Belt Location" : locationName;
  const displayLoading = firebaseGPS.loading || (isBeltLocation ? false : locationLoading);

  // Show GPS status when belt is online but no fix yet
  const showGpsStatus = firebaseGPS.beltOnline && !firebaseGPS.gpsFix;

  console.log("[Sidebar] Display position:", displayPosition, "isBeltLocation:", isBeltLocation, "showGpsStatus:", showGpsStatus, "Error:", firebaseGPS.error);

  /* Format accuracy for display */
  const accuracyLabel = accuracy
    ? accuracy < 50
      ? "High precision"
      : accuracy < 500
        ? `~${accuracy}m accuracy`
        : accuracy < 5000
          ? `~${(accuracy / 1000).toFixed(1)}km accuracy`
          : "Low precision"
    : null;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ---- Header / Logo ---- */}
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
                WOOFY          
            </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ---- Navigation ---- */}
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === "/dashboard"
                    ? pathname === "/dashboard"
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

        {/* ---- Location Widget ---- */}
        <SidebarGroup>
          <SidebarGroupLabel>Your Location</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 group-data-[collapsible=icon]:hidden">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
                {displayLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Detecting location…
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <MapPin className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isBeltLocation ? "text-emerald-500" : "text-primary"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium leading-tight">
                          {displayLocationName}
                        </p>
                        {showGpsStatus ? (
                          <p className="mt-0.5 text-[10px] text-amber-500 font-mono">
                            GPS searching... ({firebaseGPS.satellites || 0} satellites)
                          </p>
                        ) : displayPosition && displayPosition.lat && displayPosition.lng ? (
                          <p className="mt-0.5 text-[10px] text-muted-foreground font-mono">
                            {displayPosition.lat.toFixed(4)}, {displayPosition.lng.toFixed(4)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-1">
                      {isBeltLocation && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1.5 font-normal text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                        >
                          Belt GPS
                        </Badge>
                      )}
                      {showGpsStatus && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1.5 font-normal text-amber-600 border-amber-500/30 dark:text-amber-400"
                        >
                          GPS Searching
                        </Badge>
                      )}
                      {isManual && !isBeltLocation && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1.5 font-normal text-muted-foreground"
                        >
                          Manual
                        </Badge>
                      )}
                      {accuracyLabel && !isManual && !isBeltLocation && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-4 px-1.5 font-normal ${
                            accuracy && accuracy < 100
                              ? "text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                              : accuracy && accuracy < 1000
                                ? "text-amber-600 border-amber-500/30 dark:text-amber-400"
                                : "text-muted-foreground"
                          }`}
                        >
                          {accuracyLabel}
                        </Badge>
                      )}
                      {locationError && !isManual && !isBeltLocation && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1.5 font-normal text-amber-600 border-amber-500/30 dark:text-amber-400"
                        >
                          {locationError.includes("IP") ? "IP-based" : "Approximate"}
                        </Badge>
                      )}
                    </div>

                    {locationError && !isManual && !isBeltLocation && (
                      <p className="text-[10px] text-amber-500 leading-tight">
                        {locationError}
                      </p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs h-7"
                      onClick={refreshLocation}
                      disabled={displayLoading}
                    >
                      <LocateFixed className="h-3 w-3" />
                      {displayPosition ? "Refresh Location" : "Get Current Location"}
                    </Button>
                  </>
                )}
              </div>
            </div>
            {/* Collapsed icon-only view */}
            <div className="hidden group-data-[collapsible=icon]:flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={refreshLocation}
                title={locationName}
              >
                <LocateFixed className="h-4 w-4" />
              </Button>
            </div>
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
