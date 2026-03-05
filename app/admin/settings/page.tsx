"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Lock, Bell, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface NotifSettings {
  emailAlerts: boolean;
  anomalyAlerts: boolean;
  weeklyReport: boolean;
  pushNotifications: boolean;
}

export default function AdminSettingsPage() {
  const { user, refresh } = useAuth();

  // ── Profile state ───────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // ── Password state ──────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  // ── Notification prefs ──────────────────────────────
  const [notifSettings, setNotifSettings] = useState<NotifSettings>({
    emailAlerts: true,
    anomalyAlerts: true,
    weeklyReport: false,
    pushNotifications: false,
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
    (async () => {
      try {
        const [profRes, notifRes] = await Promise.all([
          fetch("/api/settings/profile"),
          fetch("/api/settings/notifications"),
        ]);
        if (profRes.ok) {
          const d = await profRes.json();
          setName(d.user.name);
          setEmail(d.user.email);
          setPhone(d.user.phone || "");
        }
        if (notifRes.ok) {
          const d = await notifRes.json();
          if (d.settings) setNotifSettings(d.settings);
        }
      } catch {}
    })();
  }, [user]);

  async function handleProfileSave() {
    setProfileLoading(true);
    setProfileMsg("");
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setProfileMsg("Profile updated successfully.");
      refresh();
    } catch (e: any) {
      setProfileMsg(e.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) {
      setPwMsg("Passwords do not match.");
      return;
    }
    setPwLoading(true);
    setPwMsg("");
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setPwMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setPwMsg(e.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  }

  async function handleNotifSave() {
    setNotifLoading(true);
    setNotifMsg("");
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifSettings),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setNotifMsg("Notification preferences saved.");
    } catch (e: any) {
      setNotifMsg(e.message || "Failed to save preferences.");
    } finally {
      setNotifLoading(false);
    }
  }

  function toggle(key: keyof NotifSettings) {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const fade = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
  };

  return (
    <div className="mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage your admin account and preferences.
        </p>
      </div>

      {/* ── Profile ──────────────────────────────────── */}
      <motion.div variants={fade} initial="hidden" animate="show" custom={0}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Profile
            </CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-1234"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleProfileSave} disabled={profileLoading}>
                {profileLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
              {profileMsg && (
                <span className="text-sm text-muted-foreground">
                  {profileMsg}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Password ─────────────────────────────────── */}
      <motion.div variants={fade} initial="hidden" animate="show" custom={1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Password
            </CardTitle>
            <CardDescription>Change your account password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handlePasswordChange} disabled={pwLoading}>
                {pwLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Password
              </Button>
              {pwMsg && (
                <span className="text-sm text-muted-foreground">{pwMsg}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Notifications ────────────────────────────── */}
      <motion.div variants={fade} initial="hidden" animate="show" custom={2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notifications
            </CardTitle>
            <CardDescription>
              Choose what notifications you receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {(
              [
                {
                  key: "emailAlerts" as const,
                  label: "Email Alerts",
                  desc: "Receive email notifications for important events.",
                },
                {
                  key: "anomalyAlerts" as const,
                  label: "Anomaly Alerts",
                  desc: "Get notified when the AI detects health anomalies.",
                },
                {
                  key: "weeklyReport" as const,
                  label: "Weekly Report",
                  desc: "Receive a weekly system summary report.",
                },
                {
                  key: "pushNotifications" as const,
                  label: "Push Notifications",
                  desc: "Browser push notifications for real-time updates.",
                },
              ] as const
            ).map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifSettings[item.key]}
                  onCheckedChange={() => toggle(item.key)}
                />
              </div>
            ))}
            <Separator />
            <div className="flex items-center gap-3">
              <Button onClick={handleNotifSave} disabled={notifLoading}>
                {notifLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Preferences
              </Button>
              {notifMsg && (
                <span className="text-sm text-muted-foreground">
                  {notifMsg}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
