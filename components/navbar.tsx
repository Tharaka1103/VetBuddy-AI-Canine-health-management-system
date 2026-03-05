"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { Dog, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";

/**
 * NavbarWrapper — renders the Navbar only on public routes.
 * Dashboard and admin routes use their own sidebar layout.
 */
export function NavbarWrapper() {
  const pathname = usePathname();
  const hideNavbar =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (hideNavbar) return null;
  return <Navbar />;
}

export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            WOOFY
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!loading && user && (
            <>
              {user.role === "admin" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">
                    <Shield className="mr-1 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-1 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
          {!loading && !user && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
