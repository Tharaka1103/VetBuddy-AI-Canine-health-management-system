"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Zap,
  TrendingUp,
  Mic,
  CheckCircle,
  XCircle,
  Brain,
  Activity,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useBeltFromLocalStorage } from "@/hooks/use-firebase-sensors";

interface TrainingSession {
  _id: string;
  commandGiven: string;
  language: string;
  headPosture: string;
  bodyPosture: string;
  atomicBehavior: string;
  isSuccessful: boolean;
  timestamp: string;
}

interface BarkRecord {
  _id: string;
  predictedEmotion: string;
  timestamp: string;
}

export default function TrainingDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: dogId } = use(params);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [barks, setBarks] = useState<BarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const belt = useBeltFromLocalStorage();

  useEffect(() => {
    async function fetchData() {
      try {
        const [sessRes, barkRes] = await Promise.all([
          fetch(`/api/training?dogId=${dogId}`),
          fetch(`/api/barks?dogId=${dogId}`),
        ]);
        if (sessRes.ok) {
          const d = await sessRes.json();
          setSessions(d.sessions || []);
        }
        if (barkRes.ok) {
          const d = await barkRes.json();
          setBarks(d.barks || []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dogId]);

  const successCount = sessions.filter((s) => s.isSuccessful).length;
  const successRate =
    sessions.length > 0
      ? Math.round((successCount / sessions.length) * 100)
      : 0;
  const aggressionCount = barks.filter(
    (b) => b.predictedEmotion.toLowerCase() === "aggression"
  ).length;

  const stats = [
    {
      label: "Total Sessions",
      value: sessions.length,
      icon: Brain,
      color: "text-primary",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      icon: TrendingUp,
      color: "text-emerald-500",
    },
    {
      label: "Bark Analyses",
      value: barks.length,
      icon: Mic,
      color: "text-blue-500",
    },
    {
      label: "Aggression Alerts",
      value: aggressionCount,
      icon: Activity,
      color: "text-destructive",
    },
  ];

  const quickLinks = [
    {
      title: "Live Training Session",
      description: "Send commands and analyze real-time posture",
      href: `/dashboard/${dogId}/training/live`,
      icon: Zap,
    },
    {
      title: "Progress Analytics",
      description: "Charts & trends for training performance",
      href: `/dashboard/${dogId}/training/progress`,
      icon: BarChart3,
    },
    {
      title: "Bark Analysis",
      description: "Upload audio and detect bark emotions",
      href: `/dashboard/${dogId}/training/barks`,
      icon: Mic,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Training Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of training sessions, bark analyses, and IoT belt status.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Belt Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">IoT Belt Status</CardTitle>
          <CardDescription>
            Real-time sensor data from the Woofy Smart Collar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant={belt.connected ? "default" : "secondary"}>
              {belt.connected ? "Connected" : "Disconnected"}
            </Badge>
            {belt.connected && (
              <>
                <span className="text-sm text-muted-foreground">
                  ❤️ {belt.heartRate ?? "—"} bpm
                </span>
                <span className="text-sm text-muted-foreground">
                  🌡️ {belt.dogTemp ?? "—"}°C
                </span>
                <span className="text-sm text-muted-foreground">
                  🏃 {belt.activityLevel ?? "—"}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((link, i) => (
          <motion.div
            key={link.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Link href={link.href}>
              <Card className="transition-colors hover:border-primary/50 hover:bg-muted/30 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <link.icon className="h-5 w-5 text-primary" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Training Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No training sessions yet. Start a live session!
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 5).map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{s.commandGiven}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {s.isSuccessful ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bark Analyses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Bark Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            {barks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No bark analyses yet. Upload an audio file!
              </p>
            ) : (
              <div className="space-y-3">
                {barks.slice(0, 5).map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {b.predictedEmotion}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(b.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        b.predictedEmotion.toLowerCase() === "aggression"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {b.predictedEmotion}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
