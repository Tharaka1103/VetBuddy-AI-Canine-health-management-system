"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Dog,
  Activity,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useGsapStagger } from "@/hooks/use-gsap";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Stats {
  totalUsers: number;
  totalCanines: number;
  totalRecords: number;
  totalAnomalies: number;
}

interface UserWithDogs {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  dogs: { _id: string; name: string; breedSize: string; age: number }[];
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  variant?: "default" | "danger";
}) {
  return (
    <Card
      className={`${
        variant === "danger"
          ? "border-destructive/30 bg-destructive/5"
          : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon
          className={`h-5 w-5 ${
            variant === "danger" ? "text-destructive" : "text-primary"
          }`}
        />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Admin Dashboard Page                                               */
/* ------------------------------------------------------------------ */
export default function AdminPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserWithDogs[]>([]);
  const [loading, setLoading] = useState(true);

  const staggerRef = useGsapStagger<HTMLDivElement>(":scope > div", 0.08);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setUsers(data.users);
        } else {
          toast.error("Failed to load admin data");
        }
      } catch {
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        <p className="mt-1 text-muted-foreground">
          System-wide overview — logged in as {authUser?.email}
        </p>
      </motion.div>

      {/* Stat Cards */}
      {stats && (
        <div ref={staggerRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
          <StatCard title="Registered Dogs" value={stats.totalCanines} icon={Dog} />
          <StatCard
            title="Health Records"
            value={stats.totalRecords}
            icon={Activity}
          />
          <StatCard
            title="Total Anomalies"
            value={stats.totalAnomalies}
            icon={AlertTriangle}
            variant="danger"
          />
        </div>
      )}

      <Separator />

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Users and their registered dogs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3 pr-4">Dogs</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium">{u.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={u.role === "admin" ? "default" : "secondary"}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        {u.dogs.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {u.dogs.map((d) => (
                              <Badge key={d._id} variant="outline">
                                {d.name} ({d.breedSize})
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
