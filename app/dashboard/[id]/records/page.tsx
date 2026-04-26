"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowLeft,
  Thermometer,
  Heart,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const RECORDS_PER_PAGE = 10;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface HealthRecord {
  _id: string;
  ambientTemp: number;
  dogTemp: number;
  heartRate: number;
  activityLevel: string;
  aiDiagnosis: string;
  aiReason: string;
  userFeedback: string;
  timestamp: string;
}

interface Canine {
  _id: string;
  name: string;
  breedSize: string;
  age: number;
}

/* ------------------------------------------------------------------ */
/*  Warning Level Helper                                               */
/* ------------------------------------------------------------------ */
type WarningLevel = "normal" | "caution" | "danger";

interface VitalWarning {
  level: WarningLevel;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof ShieldCheck;
}

function getTempWarning(avgTemp: number): VitalWarning {
  if (avgTemp >= 39.5) {
    return {
      level: "danger",
      label: "High — Possible Fever Zone",
      color: "text-red-700 dark:text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/40",
      icon: ShieldAlert,
    };
  } else if (avgTemp >= 38.8) {
    return {
      level: "caution",
      label: "Elevated — Monitor Closely",
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/40",
      icon: AlertTriangle,
    };
  }
  return {
    level: "normal",
    label: "Normal Range",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/40",
    icon: ShieldCheck,
  };
}

function getHRWarning(avgHR: number): VitalWarning {
  if (avgHR >= 120) {
    return {
      level: "danger",
      label: "High — Possible Tachycardia Zone",
      color: "text-red-700 dark:text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/40",
      icon: ShieldAlert,
    };
  } else if (avgHR >= 100) {
    return {
      level: "caution",
      label: "Elevated — Monitor Closely",
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/40",
      icon: AlertTriangle,
    };
  }
  return {
    level: "normal",
    label: "Normal Range",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/40",
    icon: ShieldCheck,
  };
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function HealthRecordsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [canine, setCanine] = useState<Canine | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  /* ---- Fetch data ---- */
  const fetchData = useCallback(async () => {
    try {
      const [canineRes, healthRes] = await Promise.all([
        fetch(`/api/canines/${id}`),
        fetch(`/api/health?canineId=${id}`),
      ]);

      if (canineRes.ok) {
        const data = await canineRes.json();
        setCanine(data.canine);
      }
      if (healthRes.ok) {
        const data = await healthRes.json();
        setRecords(data.records || []);
      }
    } catch {
      toast.error("Failed to load health records");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- Feedback handler ---- */
  const handleFeedback = async (
    recordId: string,
    feedback: "Correct" | "Incorrect"
  ) => {
    try {
      const res = await fetch(`/api/health/${recordId}/feedback`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      if (res.ok) {
        setRecords((prev) =>
          prev.map((r) =>
            r._id === recordId ? { ...r, userFeedback: feedback } : r
          )
        );
        toast.success(
          feedback === "Correct"
            ? "Thank you! Diagnosis confirmed."
            : "Feedback sent. The AI will learn from this."
        );
      }
    } catch {
      toast.error("Failed to submit feedback");
    }
  };

  /* ---- Compute averages ---- */
  const avgTemp =
    records.length > 0
      ? Number(
          (records.reduce((sum, r) => sum + r.dogTemp, 0) / records.length).toFixed(1)
        )
      : 0;
  const avgHR =
    records.length > 0
      ? Math.round(
          records.reduce((sum, r) => sum + r.heartRate, 0) / records.length
        )
      : 0;

  const anomalyCount = records.filter(
    (r) => r.aiDiagnosis === "Anomaly"
  ).length;
  const healthyCount = records.length - anomalyCount;

  const tempWarning = getTempWarning(avgTemp);
  const hrWarning = getHRWarning(avgHR);
  const TempIcon = tempWarning.icon;
  const HRIcon = hrWarning.icon;

  /* ---- Pagination ---- */
  const totalPages = Math.max(1, Math.ceil(records.length / RECORDS_PER_PAGE));
  const startIdx = (currentPage - 1) * RECORDS_PER_PAGE;
  const paginatedRecords = records.slice(startIdx, startIdx + RECORDS_PER_PAGE);

  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* ================================================================ */}
      {/*  HEADER                                                          */}
      {/* ================================================================ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/dashboard/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Health Records{canine ? ` — ${canine.name}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete vitals history &amp; warning level overview
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* ================================================================ */}
        {/*  WARNING LEVEL CARDS — Temp & Heart Rate Averages              */}
        {/* ================================================================ */}
        {records.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Temperature Warning */}
              <Card className={`border ${tempWarning.borderColor}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    Body Temperature
                  </CardTitle>
                  <CardDescription>
                    Average across {records.length} record
                    {records.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold tabular-nums">
                        {avgTemp}°C
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Average body temperature
                      </p>
                    </div>
                    <div
                      className={`flex flex-col items-center gap-1 rounded-xl ${tempWarning.bgColor} px-4 py-3`}
                    >
                      <TempIcon className={`h-6 w-6 ${tempWarning.color}`} />
                      <span
                        className={`text-xs font-semibold ${tempWarning.color}`}
                      >
                        {tempWarning.label}
                      </span>
                    </div>
                  </div>
                  {tempWarning.level !== "normal" && (
                    <Alert
                      variant={
                        tempWarning.level === "danger" ? "destructive" : "warning"
                      }
                      className="mt-3"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>
                        {tempWarning.level === "danger"
                          ? "Temperature Warning"
                          : "Temperature Caution"}
                      </AlertTitle>
                      <AlertDescription>
                        {tempWarning.level === "danger"
                          ? `The average body temperature (${avgTemp}°C) is above the safe threshold of 39.5°C. This may indicate fever or heat stress. Consult your veterinarian.`
                          : `The average body temperature (${avgTemp}°C) is slightly elevated. Keep monitoring — normal canine range is 37.5°C – 39.2°C.`}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Heart Rate Warning */}
              <Card className={`border ${hrWarning.borderColor}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Heart className="h-4 w-4 text-rose-500" />
                    Heart Rate
                  </CardTitle>
                  <CardDescription>
                    Average across {records.length} record
                    {records.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold tabular-nums">
                        {avgHR} bpm
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Average heart rate
                      </p>
                    </div>
                    <div
                      className={`flex flex-col items-center gap-1 rounded-xl ${hrWarning.bgColor} px-4 py-3`}
                    >
                      <HRIcon className={`h-6 w-6 ${hrWarning.color}`} />
                      <span
                        className={`text-xs font-semibold ${hrWarning.color}`}
                      >
                        {hrWarning.label}
                      </span>
                    </div>
                  </div>
                  {hrWarning.level !== "normal" && (
                    <Alert
                      variant={
                        hrWarning.level === "danger" ? "destructive" : "warning"
                      }
                      className="mt-3"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>
                        {hrWarning.level === "danger"
                          ? "Heart Rate Warning"
                          : "Heart Rate Caution"}
                      </AlertTitle>
                      <AlertDescription>
                        {hrWarning.level === "danger"
                          ? `The average heart rate (${avgHR} bpm) exceeds the safe resting threshold of 120 bpm. This may indicate tachycardia or sustained stress. Seek veterinary advice.`
                          : `The average heart rate (${avgHR} bpm) is somewhat elevated. Normal resting range for most dogs is 60–100 bpm.`}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/*  QUICK STATS BAR                                                */}
        {/* ================================================================ */}
        {records.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Records</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {records.length}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Healthy
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {healthyCount}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  Anomalies
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">
                  {anomalyCount}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  Latest
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {records.length > 0
                    ? new Date(records[0].timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/*  FULL RECORDS TABLE                                             */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                All Health Records
              </CardTitle>
              <CardDescription>
                Complete vitals history with AI diagnosis and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Activity className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No health records yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Run an AI analysis from the health dashboard to create your
                    first record
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-border text-left text-muted-foreground">
                        <th className="px-3 pb-2">#</th>
                        <th className="px-3 pb-2">Time</th>
                        <th className="px-3 pb-2">Ambient</th>
                        <th className="px-3 pb-2">Dog Temp</th>
                        <th className="px-3 pb-2">Heart Rate</th>
                        <th className="px-3 pb-2">Activity</th>
                        <th className="px-3 pb-2">Diagnosis</th>
                        <th className="px-3 pb-2">Reason</th>
                        <th className="px-3 pb-2">Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRecords.map((r, idx) => (
                        <tr
                          key={r._id}
                          className={`border-b border-border/40 transition-colors hover:bg-muted/30 ${
                            r.aiDiagnosis === "Anomaly"
                              ? "bg-destructive/3"
                              : ""
                          }`}
                        >
                          <td className="px-3 py-3 tabular-nums text-muted-foreground">
                            {startIdx + idx + 1}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {new Date(r.timestamp).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-3 py-3 tabular-nums">
                            {r.ambientTemp}°C
                          </td>
                          <td
                            className={`px-3 py-3 tabular-nums font-medium ${
                              r.dogTemp >= 39.5
                                ? "text-red-600 dark:text-red-400"
                                : r.dogTemp < 37.5
                                  ? "text-blue-600 dark:text-blue-400"
                                  : ""
                            }`}
                          >
                            {r.dogTemp}°C
                          </td>
                          <td
                            className={`px-3 py-3 tabular-nums font-medium ${
                              r.heartRate >= 120
                                ? "text-red-600 dark:text-red-400"
                                : r.heartRate < 60
                                  ? "text-blue-600 dark:text-blue-400"
                                  : ""
                            }`}
                          >
                            {r.heartRate} bpm
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant="outline" className="text-xs">
                              {r.activityLevel}
                            </Badge>
                          </td>
                          <td className="px-3 py-3">
                            <Badge
                              variant={
                                r.aiDiagnosis === "Anomaly"
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {r.aiDiagnosis}
                            </Badge>
                          </td>
                          <td className="px-3 py-3 max-w-48 truncate text-xs text-muted-foreground">
                            {r.aiReason || "—"}
                          </td>
                          <td className="px-3 py-3">
                            {r.userFeedback === "Pending" &&
                            r.aiDiagnosis === "Anomaly" ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() =>
                                    handleFeedback(r._id, "Correct")
                                  }
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" /> Yes
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() =>
                                    handleFeedback(r._id, "Incorrect")
                                  }
                                >
                                  <XCircle className="mr-1 h-3 w-3" /> No
                                </Button>
                              </div>
                            ) : (
                              <Badge
                                variant={
                                  r.userFeedback === "Correct"
                                    ? "default"
                                    : r.userFeedback === "Incorrect"
                                      ? "destructive"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {r.userFeedback}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {records.length > RECORDS_PER_PAGE && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {getVisiblePages().map((page, i) =>
                        page === "ellipsis" ? (
                          <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={currentPage === page}
                              onClick={() => setCurrentPage(page)}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  <p className="text-xs text-muted-foreground">
                    Showing {startIdx + 1}–{Math.min(startIdx + RECORDS_PER_PAGE, records.length)} of {records.length} records
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ================================================================ */}
        {/*  BACK BUTTON                                                    */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardContent className="flex flex-wrap gap-3 py-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/${id}`}>
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Back to Health Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
