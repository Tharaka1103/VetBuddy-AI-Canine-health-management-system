"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  HeartPulse,
  Info,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  _id: string;
  type: "anomaly" | "reminder" | "info" | "alert";
  title: string;
  message: string;
  isRead: boolean;
  canineId?: string;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  anomaly: <AlertTriangle className="h-5 w-5 text-orange-500" />,
  alert: <AlertTriangle className="h-5 w-5 text-destructive" />,
  reminder: <HeartPulse className="h-5 w-5 text-blue-500" />,
  info: <Info className="h-5 w-5 text-muted-foreground" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.notifications);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch {}
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications/mark-all", {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch {
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      <Separator />

      {/* Empty state */}
      {notifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-sm text-muted-foreground">
              Notifications about your dogs&apos; health will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notification list */}
      <AnimatePresence mode="popLayout">
        {notifications.map((n, i) => (
          <motion.div
            key={n._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <Card
              className={`transition-colors ${
                !n.isRead
                  ? "border-primary/30 bg-primary/5"
                  : "opacity-80"
              }`}
            >
              <CardContent className="flex items-start gap-4 py-4">
                {/* Icon */}
                <div className="mt-0.5 shrink-0">
                  {typeIcons[n.type] || typeIcons.info}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!n.isRead && (
                      <Badge
                        variant="default"
                        className="h-5 px-1.5 text-[10px]"
                      >
                        NEW
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {/* Mark as read */}
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => markAsRead(n._id)}
                    title="Mark as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
