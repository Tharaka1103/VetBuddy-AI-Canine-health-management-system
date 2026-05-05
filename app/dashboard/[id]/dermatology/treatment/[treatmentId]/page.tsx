"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  //// Status change
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Upload,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Camera,
  Heart,
  Thermometer,
  Calendar,
  TrendingDown,
  Activity,
  ImageIcon,
  Plus,
  ArrowRight,
  Stethoscope,
  Download,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Clock,
  Dumbbell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { useBeltFromLocalStorage } from "@/hooks/use-firebase-sensors";
import { IoTConnectionCard } from "@/components/iot-connection-card";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ProgressLog {
  _id?: string;
  date: string;
  imageUrl: string;
  affectedAreaPercentage: number;
  heartRate?: number;
  temperature?: number;
  notes?: string;
}

interface Treatment {
  _id: string;
  canineId: string;
  diseaseName: string;
  confidence: number;
  initialSeverityLevel: string;
  initialAffectedArea: number;
  initialImageUrl: string;
  initialHeartRate?: number;
  initialTemperature?: number;
  status: "Diagnosed" | "In Treatment" | "Recovered";
  progressLogs: ProgressLog[];
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Immunity Level Calculation                                         */
/* ------------------------------------------------------------------ */
type ImmunityLevel = "High" | "Medium" | "Low";

interface ImmunityData {
  level: ImmunityLevel;
  days: number;
  label: string;
  color: string;
  dos: string[];
  donts: string[];
}

function calculateImmunity(treatment: Treatment): ImmunityData {
  const start = new Date(treatment.createdAt);
  const end =
    treatment.status === "Recovered"
      ? new Date(treatment.updatedAt)
      : new Date();
  const diffMs = end.getTime() - start.getTime();
  const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  if (days < 7) {
    return {
      level: "High",
      days,
      label: "Fast Recovery",
      color: "text-emerald-600 dark:text-emerald-400",
      dos: [
        "Resume regular exercise and outdoor walks",
        "Maintain a normal, balanced diet",
        "Continue regular grooming routine",
        "Allow supervised socializing with other dogs",
        "Schedule routine vet check-ups as usual",
      ],
      donts: [
        "Skip follow-up vet appointments",
        "Introduce sudden diet changes",
        "Ignore minor recurring symptoms",
      ],
    };
  } else if (days <= 14) {
    return {
      level: "Medium",
      days,
      label: "Moderate Recovery",
      color: "text-amber-600 dark:text-amber-400",
      dos: [
        "Gradually increase exercise intensity",
        "Provide a nutrient-rich recovery diet",
        "Keep the affected area clean and dry",
        "Monitor for recurrence of symptoms daily",
        "Use prescribed medicated shampoo if advised",
      ],
      donts: [
        "Allow unsupervised play in dog parks",
        "Bathe more than once a week",
        "Use harsh chemical grooming products",
        "Skip prescribed medications",
      ],
    };
  } else {
    return {
      level: "Low",
      days,
      label: "Slow Recovery",
      color: "text-red-600 dark:text-red-400",
      dos: [
        "Prioritize rest and limit strenuous activity",
        "Feed a high-protein, immune-boosting diet",
        "Keep the skin dry; apply vet-prescribed ointments",
        "Schedule bi-weekly vet follow-ups",
        "Consider immune-support supplements (vet-approved)",
      ],
      donts: [
        "Bathe frequently — limit to vet-approved intervals",
        "Visit crowded dog parks or boarding facilities",
        "Allow exposure to extreme heat or rain",
        "Delay vet visits if symptoms worsen",
        "Use over-the-counter human skin products",
      ],
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: Severity Badge                                             */
/* ------------------------------------------------------------------ */
function SeverityBadge({ level }: { level: string }) {
  const cls: Record<string, string> = {
    Mild: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
    Moderate:
      "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
    Severe: "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400",
  };
  return (
    <Badge variant="outline" className={`${cls[level] || ""} font-medium`}>
      {level === "Severe" && <ShieldAlert className="mr-1 h-3 w-3" />}
      {level === "Moderate" && <AlertTriangle className="mr-1 h-3 w-3" />}
      {level === "Mild" && <ShieldCheck className="mr-1 h-3 w-3" />}
      {level}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: Status Badge                                               */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    Diagnosed:
      "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
    "In Treatment":
      "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
    Recovered:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
  };
  return (
    <Badge variant="outline" className={`${cls[status] || ""} font-medium`}>
      {status === "Recovered" && <CheckCircle className="mr-1 h-3 w-3" />}
      {status}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom Recharts Tooltip                                            */
/* ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }) => (
        <p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
          {entry.name === "Affected %" || entry.name === "Area %" ? "%" : ""}
          {entry.name === "Temp" ? "°C" : ""}
          {entry.name === "HR" ? " bpm" : ""}
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function TreatmentTrackingPage({
  params,
}: {
  params: Promise<{ id: string; treatmentId: string }>;
}) {
  const { id, treatmentId } = use(params);
  const router = useRouter();

  // IoT Belt from localStorage
  const belt = useBeltFromLocalStorage(2000);

  // Treatment data
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [loading, setLoading] = useState(true);
  const [canineName, setCanineName] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Progress upload dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progressFile, setProgressFile] = useState<File | null>(null);
  const [progressPreview, setProgressPreview] = useState<string | null>(null);
  const [progressNotes, setProgressNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [progressDiag, setProgressDiag] = useState<any>(null);

  // Status change
  const [changingStatus, setChangingStatus] = useState(false);

  /* ---- Fetch treatment ---- */
  const fetchTreatment = useCallback(async () => {
    try {
      const res = await fetch(`/api/health/treatments/${treatmentId}`);
      if (res.ok) {
        const data = await res.json();
        setTreatment(data.treatment);
      } else {
        toast.error("Treatment not found");
        router.push(`/dashboard/${id}/dermatology`);
      }
    } catch {
      toast.error("Failed to load treatment");
    } finally {
      setLoading(false);
    }
  }, [treatmentId, id, router]);
// Status change
  useEffect(() => {
    fetchTreatment();
  }, [fetchTreatment]);

  /* ---- Fetch canine name ---- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/canines/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCanineName(data.canine?.name || "Unknown");
        }
      } catch {
        /* silent */
      }
    })();
  }, [id]);

  /* ---- Generate PDF Report ---- */
  const handleDownloadPdf = async () => {
    if (!pdfRef.current || !treatment) return;
    setGeneratingPdf(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(
        (pdfWidth - 20) / imgWidth,
        (pdfHeight - 20) / imgHeight
      );
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const x = (pdfWidth - finalWidth) / 2;
      pdf.addImage(imgData, "PNG", x, 10, finalWidth, finalHeight);
      pdf.save(
        `WOOFY_Report_${canineName || "Dog"}_${treatment.diseaseName}_${new Date().toISOString().slice(0, 10)}.pdf`
      );
      toast.success("PDF report downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  /* ---- Change Status ---- */
  const handleStatusChange = async (newStatus: string) => {
    if (!treatment) return;
    setChangingStatus(true);
    try {
      const res = await fetch(`/api/health/treatments/${treatmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setTreatment(data.treatment);
        toast.success(`Status updated to "${newStatus}"`);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setChangingStatus(false);
    }
  };

  /* ---- Convert File → base64 data URL ---- */
  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  /* ---- Progress file selection ---- */
  const handleProgressFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setProgressFile(file);
    setProgressPreview(await fileToDataUrl(file));
    setProgressDiag(null);
  };

  /* ---- Analyze progress image ---- */
  const handleAnalyzeProgress = async () => {
    if (!progressFile) return;
    setAnalyzing(true);
    setProgressDiag(null);
    try {
      const formData = new FormData();
      formData.append("file", progressFile);
      const res = await fetch("/api/health/skin-disease", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      setProgressDiag(result);
      if (result.status === "success") {
        toast.success("Progress image analyzed");
      } else {
        toast.warning(result.message || "Analysis returned a warning");
      }
    } catch {
      toast.error("Failed to analyze progress image");
    } finally {
      setAnalyzing(false);
    }
  };

  /* ---- Submit progress log ---- */
  const handleSubmitProgress = async () => {
    if (!progressDiag || progressDiag.status !== "success") return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/health/treatments/${treatmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressLog: {
            date: new Date().toISOString(),
            imageUrl: progressPreview || "",
            affectedAreaPercentage:
              progressDiag.affected_area_percentage ?? 0,
            heartRate: belt.heartRate ?? undefined,
            temperature: belt.dogTemp ?? undefined,
            notes: progressNotes.trim() || undefined,
          },
          status: "In Treatment",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTreatment(data.treatment);
        setDialogOpen(false);
        setProgressFile(null);
        setProgressPreview(null);
        setProgressNotes("");
        setProgressDiag(null);
        toast.success("Progress logged with belt vitals!");
      }
    } catch {
      toast.error("Failed to save progress");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- Build chart data ---- */
  const buildChartData = () => {
    if (!treatment) return [];
    const points = [
      {
        label: "Baseline",
        date: new Date(treatment.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        area: treatment.initialAffectedArea,
        hr: treatment.initialHeartRate ?? null,
        temp: treatment.initialTemperature ?? null,
      },
      ...treatment.progressLogs.map((log, i) => ({
        label: `Log ${i + 1}`,
        date: new Date(log.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        area: log.affectedAreaPercentage,
        hr: log.heartRate ?? null,
        temp: log.temperature ?? null,
      })),
    ];
    return points;
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-60 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Treatment not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const chartData = buildChartData();
  const immunity = calculateImmunity(treatment);

  return (
    <>
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
            onClick={() => router.push(`/dashboard/${id}/dermatology`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {treatment.diseaseName}
              </h1>
              <StatusBadge status={treatment.status} />
              <SeverityBadge level={treatment.initialSeverityLevel} />
            </div>
            <p className="text-sm text-muted-foreground">
              Treatment tracking &amp; progress monitoring
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* ================================================================ */}
        {/*  BASELINE INFO CARD                                             */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4 text-primary" />
                Baseline Diagnosis
              </CardTitle>
              <CardDescription>
                Captured on{" "}
                {new Date(treatment.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {/* Affected Area */}
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Affected Area</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">
                    {treatment.initialAffectedArea}%
                  </p>
                </div>

                {/* Confidence */}
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">AI Confidence</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                    {Math.round(treatment.confidence * 100)}%
                  </p>
                </div>

                {/* Heart Rate */}
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Heart className="h-3 w-3 text-rose-500" />
                    Baseline HR
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    {treatment.initialHeartRate
                      ? `${treatment.initialHeartRate} bpm`
                      : "—"}
                  </p>
                </div>

                {/* Temperature */}
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Thermometer className="h-3 w-3 text-orange-500" />
                    Baseline Temp
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    {treatment.initialTemperature
                      ? `${treatment.initialTemperature}°C`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Status changer */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Update Status:
                </span>
                <Select
                  value={treatment.status}
                  onValueChange={handleStatusChange}
                  disabled={changingStatus}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diagnosed">Diagnosed</SelectItem>
                    <SelectItem value="In Treatment">In Treatment</SelectItem>
                    <SelectItem value="Recovered">Recovered</SelectItem>
                  </SelectContent>
                </Select>
                {changingStatus && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ================================================================ */}
        {/*  IoT BELT STATUS                                                */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <IoTConnectionCard
            connected={belt.connected}
            heartRate={belt.heartRate}
            dogTemp={belt.dogTemp}
            ambientTemp={belt.ambientTemp}
            activityLevel={belt.activityLevel}
            lastSyncedAt={belt.lastSyncedAt}
            dashboardLink={`/dashboard/${id}`}
          />
        </motion.div>

        {/* ================================================================ */}
        {/*  RECHARTS — PROGRESS CHARTS                                    */}
        {/* ================================================================ */}
        {chartData.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  Progress Charts
                </CardTitle>
                <CardDescription>
                  Track affected area, heart rate and temperature over time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* --- Affected Area Chart --- */}
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Affected Area %
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="areaGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(0 72% 51%)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(0 72% 51%)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border/40"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        domain={[0, 100]}
                        tickFormatter={(v: number) => `${v}%`}
                        className="text-muted-foreground"
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <ReferenceLine
                        y={0}
                        strokeDasharray="3 3"
                        stroke="hsl(142 71% 45%)"
                        label={{
                          value: "Recovered",
                          position: "right",
                          fontSize: 10,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="area"
                        name="Area %"
                        stroke="hsl(0 72% 51%)"
                        fill="url(#areaGrad)"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "hsl(0 72% 51%)" }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* --- Heart Rate Chart --- */}
                {chartData.some((d) => d.hr !== null) && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Heart Rate (bpm)
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-border/40"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          className="text-muted-foreground"
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          domain={["auto", "auto"]}
                          className="text-muted-foreground"
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <ReferenceLine
                          y={100}
                          strokeDasharray="4 4"
                          stroke="hsl(142 71% 45%)"
                          label={{
                            value: "Normal Range",
                            position: "right",
                            fontSize: 10,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="hr"
                          name="HR"
                          stroke="hsl(346 77% 50%)"
                          strokeWidth={2}
                          dot={{ r: 4, fill: "hsl(346 77% 50%)" }}
                          activeDot={{ r: 6 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* --- Temperature Chart --- */}
                {chartData.some((d) => d.temp !== null) && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Body Temperature (°C)
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-border/40"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          className="text-muted-foreground"
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          domain={["auto", "auto"]}
                          className="text-muted-foreground"
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <ReferenceLine
                          y={39.2}
                          strokeDasharray="4 4"
                          stroke="hsl(142 71% 45%)"
                          label={{
                            value: "Normal (39.2°C)",
                            position: "right",
                            fontSize: 10,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          name="Temp"
                          stroke="hsl(25 95% 53%)"
                          strokeWidth={2}
                          dot={{ r: 4, fill: "hsl(25 95% 53%)" }}
                          activeDot={{ r: 6 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Show message when no progress logs yet (only baseline) */}
        {chartData.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <TrendingDown className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  No progress data yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload a follow-up image to start tracking recovery progress
                  charts
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/*  ADD PROGRESS LOG BUTTON + DIALOG                              */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg" disabled={!belt.connected}>
                <Plus className="mr-2 h-4 w-4" />
                {belt.connected
                  ? "Log Progress Update"
                  : "Connect Belt to Log Progress"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Log Progress Update</DialogTitle>
                <DialogDescription>
                  Upload a follow-up photo. Belt vitals will be captured
                  automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* File upload */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProgressFile}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    id="progress-upload"
                  />
                  <div
                    className={`flex min-h-36 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                      progressPreview
                        ? "border-primary/30 bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {progressPreview ? (
                      <div className="w-full p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={progressPreview}
                          alt="Progress"
                          className="mx-auto max-h-40 rounded-lg object-contain"
                        />
                        <p className="mt-1 text-center text-xs text-muted-foreground">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-6">
                        <Camera className="h-5 w-5 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Upload follow-up photo
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Belt vitals preview */}
                {belt.connected && (
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-sm">
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Belt:
                    </span>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Heart className="h-3 w-3 text-rose-500" />
                      {belt.heartRate} bpm
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Thermometer className="h-3 w-3 text-orange-500" />
                      {belt.dogTemp}°C
                    </Badge>
                  </div>
                )}

                {/* Analyze button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAnalyzeProgress}
                  disabled={!progressFile || analyzing}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Activity className="mr-2 h-4 w-4" />
                      Analyze Image
                    </>
                  )}
                </Button>

                {/* Analysis result */}
                <AnimatePresence>
                  {progressDiag && progressDiag.status === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Affected Area
                          </span>
                          <span className="text-lg font-bold tabular-nums">
                            {progressDiag.affected_area_percentage}%
                          </span>
                        </div>
                        {treatment && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {progressDiag.affected_area_percentage <
                            treatment.initialAffectedArea ? (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                Improved by{" "}
                                {(
                                  treatment.initialAffectedArea -
                                  progressDiag.affected_area_percentage
                                ).toFixed(1)}
                                % from baseline
                              </span>
                            ) : progressDiag.affected_area_percentage >
                              treatment.initialAffectedArea ? (
                              <span className="text-destructive">
                                Worsened by{" "}
                                {(
                                  progressDiag.affected_area_percentage -
                                  treatment.initialAffectedArea
                                ).toFixed(1)}
                                % from baseline
                              </span>
                            ) : (
                              <span>No change from baseline</span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Notes */}
                      <Textarea
                        placeholder="Optional notes (e.g., applied ointment, vet visit)..."
                        value={progressNotes}
                        onChange={(e) => setProgressNotes(e.target.value)}
                        className="resize-none"
                        rows={2}
                      />

                      {/* Save */}
                      <Button
                        className="w-full"
                        onClick={handleSubmitProgress}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Save Progress Log
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {progressDiag && progressDiag.status === "warning" && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    {progressDiag.message}
                  </p>
                )}
                {progressDiag && progressDiag.status === "error" && (
                  <p className="text-sm text-destructive">
                    {progressDiag.message}
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* ================================================================ */}
        {/*  VISUAL IMAGE TIMELINE                                          */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Visual Timeline
              </CardTitle>
              <CardDescription>
                Track recovery through images over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

                {/* Baseline Entry */}
                <div className="relative flex gap-4 pb-8">
                  <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 rounded-lg border border-border/60 bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">
                        Initial Diagnosis
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(treatment.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-normal"
                      >
                        {treatment.initialAffectedArea}% affected
                      </Badge>
                      {treatment.initialHeartRate && (
                        <Badge
                          variant="outline"
                          className="gap-0.5 text-[11px] font-normal"
                        >
                          <Heart className="h-2.5 w-2.5 text-rose-500" />
                          {treatment.initialHeartRate} bpm
                        </Badge>
                      )}
                      {treatment.initialTemperature && (
                        <Badge
                          variant="outline"
                          className="gap-0.5 text-[11px] font-normal"
                        >
                          <Thermometer className="h-2.5 w-2.5 text-orange-500" />
                          {treatment.initialTemperature}°C
                        </Badge>
                      )}
                    </div>
                    {treatment.initialImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={treatment.initialImageUrl}
                        alt="Initial diagnosis"
                        className="max-h-32 rounded-lg border border-border/40 object-contain"
                      />
                    )}
                  </div>
                </div>

                {/* Progress Entries */}
                {treatment.progressLogs.map((log, idx) => {
                  const prevArea =
                    idx === 0
                      ? treatment.initialAffectedArea
                      : treatment.progressLogs[idx - 1]
                          .affectedAreaPercentage;
                  const improved = log.affectedAreaPercentage < prevArea;
                  const worsened = log.affectedAreaPercentage > prevArea;

                  return (
                    <motion.div
                      key={log._id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="relative flex gap-4 pb-8"
                    >
                      <div
                        className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${
                          improved
                            ? "border-emerald-500 bg-emerald-500/10"
                            : worsened
                              ? "border-red-500 bg-red-500/10"
                              : "border-amber-500 bg-amber-500/10"
                        }`}
                      >
                        {improved ? (
                          <TrendingDown className="h-5 w-5 text-emerald-500" />
                        ) : worsened ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Activity className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 rounded-lg border border-border/60 bg-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">
                            Progress Log #{idx + 1}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <Badge
                            variant="secondary"
                            className={`text-[11px] font-normal ${
                              improved
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : worsened
                                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                  : ""
                            }`}
                          >
                            {log.affectedAreaPercentage}% affected
                            {improved && " ↓"}
                            {worsened && " ↑"}
                          </Badge>
                          {log.heartRate && (
                            <Badge
                              variant="outline"
                              className="gap-0.5 text-[11px] font-normal"
                            >
                              <Heart className="h-2.5 w-2.5 text-rose-500" />
                              {log.heartRate} bpm
                            </Badge>
                          )}
                          {log.temperature && (
                            <Badge
                              variant="outline"
                              className="gap-0.5 text-[11px] font-normal"
                            >
                              <Thermometer className="h-2.5 w-2.5 text-orange-500" />
                              {log.temperature}°C
                            </Badge>
                          )}
                        </div>

                        {log.notes && (
                          <p className="mb-3 text-xs text-muted-foreground italic">
                            &ldquo;{log.notes}&rdquo;
                          </p>
                        )}

                        {log.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={log.imageUrl}
                            alt={`Progress ${idx + 1}`}
                            className="max-h-32 rounded-lg border border-border/40 object-contain"
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* End marker */}
                {treatment.status === "Recovered" && (
                  <div className="relative flex gap-4">
                    <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/20">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Recovered!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ================================================================ */}
        {/*  IMMUNITY LEVEL & DO'S/DON'TS                                  */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Immunity Level Assessment
              </CardTitle>
              <CardDescription>
                Recovery speed analysis with personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Immunity Level Badge */}
              <div className="flex flex-col items-center rounded-xl border border-border/60 bg-muted/20 p-6 text-center">
                <div className={`flex items-center gap-2 text-3xl font-bold ${immunity.color}`}>
                  {immunity.level === "High" && <Zap className="h-7 w-7" />}
                  {immunity.level === "Medium" && <Clock className="h-7 w-7" />}
                  {immunity.level === "Low" && <ShieldAlert className="h-7 w-7" />}
                  {immunity.level} Immunity
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {immunity.label} — {immunity.days} day{immunity.days !== 1 ? "s" : ""}{" "}
                  {treatment.status === "Recovered" ? "to recovery" : "since diagnosis"}
                </p>
              </div>

              {/* Do's and Don'ts Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* DO'S */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    <ThumbsUp className="h-4 w-4" />
                    Recommended Activities (Do&apos;s)
                  </h4>
                  <ul className="space-y-2">
                    {immunity.dos.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-300">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DON'TS */}
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
                    <ThumbsDown className="h-4 w-4" />
                    Restricted Activities (Don&apos;ts)
                  </h4>
                  <ul className="space-y-2">
                    {immunity.donts.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ================================================================ */}
        {/*  HEALTH RECOVERY TRAINING RECOMMENDATION                       */}
        {/* ================================================================ */}
        {(immunity.level === "High" || immunity.level === "Medium") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.27 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-semibold">Health Recovery Training</h4>
                  <p className="text-sm text-muted-foreground">
                    Boost your dog&apos;s recovery! Gentle training and physical activity can improve immunological health.
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/dashboard/${id}/training/progress`}>
                    <Activity className="mr-2 h-4 w-4" />
                    Go to Training Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/*  DOWNLOAD PDF REPORT BUTTON                                    */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
        >
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Full Report (PDF)
              </>
            )}
          </Button>
        </motion.div>

        {/* ================================================================ */}
        {/*  QUICK ACTIONS                                                  */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="flex flex-wrap gap-3 py-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/${id}/dermatology`}>
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Back to Dermatology Hub
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/${id}`}>
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Health Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>

    {/* ================================================================== */}
    {/*  HIDDEN PDF LAYOUT — Rendered off-screen for html2canvas           */}
    {/* ================================================================== */}
    <div
      ref={pdfRef}
      className="fixed -left-2499.75 top-0 w-200 bg-white text-black"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      <div className="p-10">
        {/* PDF Header */}
        <div className="mb-6 flex items-center justify-between border-b-2 border-teal-500 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-teal-700">WOOFY</h1>
            <p className="text-sm text-gray-500">
              Smart Canine Health Management System
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              Dermatology Report
            </p>
            <p className="text-xs text-gray-400">
              Generated: {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Dog & Diagnosis Info */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Patient Information
            </h3>
            <p className="text-lg font-bold text-gray-800">
              {canineName || "—"}
            </p>
            <p className="text-sm text-gray-600">
              Diagnosed:{" "}
              {new Date(treatment.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Diagnosis
            </h3>
            <p className="text-lg font-bold text-gray-800">
              {treatment.diseaseName}
            </p>
            <div className="mt-1 flex gap-2">
              <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                {Math.round(treatment.confidence * 100)}% Confidence
              </span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  treatment.initialSeverityLevel === "Severe"
                    ? "bg-red-100 text-red-700"
                    : treatment.initialSeverityLevel === "Moderate"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {treatment.initialSeverityLevel}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  treatment.status === "Recovered"
                    ? "bg-emerald-100 text-emerald-700"
                    : treatment.status === "In Treatment"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {treatment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Baseline Vitals */}
        <div className="mb-6 grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-500">Affected Area</p>
            <p className="text-xl font-bold text-red-600">
              {treatment.initialAffectedArea}%
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-500">AI Confidence</p>
            <p className="text-xl font-bold text-teal-600">
              {Math.round(treatment.confidence * 100)}%
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-500">Baseline HR</p>
            <p className="text-xl font-bold text-gray-800">
              {treatment.initialHeartRate
                ? `${treatment.initialHeartRate} bpm`
                : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-500">Baseline Temp</p>
            <p className="text-xl font-bold text-gray-800">
              {treatment.initialTemperature
                ? `${treatment.initialTemperature}°C`
                : "—"}
            </p>
          </div>
        </div>

        {/* Severity Progress Table */}
        {chartData.length > 1 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-600">
              Severity Progress Log
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-teal-500 bg-teal-50">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-teal-700">
                    Date
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-teal-700">
                    Affected %
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-teal-700">
                    Heart Rate
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-teal-700">
                    Temperature
                  </th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((point, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="px-3 py-2 font-medium text-gray-700">
                      {point.label} ({point.date})
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-800">
                      {point.area}%
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-800">
                      {point.hr !== null ? `${point.hr} bpm` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-800">
                      {point.temp !== null ? `${point.temp}°C` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Immunity Level */}
        <div className="mb-6 rounded-lg border-2 border-teal-500 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase text-gray-600">
            Immunity Level Assessment
          </h3>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-4 py-1.5 text-lg font-bold ${
                immunity.level === "High"
                  ? "bg-emerald-100 text-emerald-700"
                  : immunity.level === "Medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {immunity.level} Immunity
            </span>
            <span className="text-sm text-gray-600">
              {immunity.label} — {immunity.days} day
              {immunity.days !== 1 ? "s" : ""}{" "}
              {treatment.status === "Recovered"
                ? "to recovery"
                : "since diagnosis"}
            </span>
          </div>
        </div>

        {/* Do's and Don'ts */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <h4 className="mb-2 text-sm font-bold text-emerald-700">
              ✅ Recommended (Do&apos;s)
            </h4>
            <ul className="space-y-1">
              {immunity.dos.map((item, i) => (
                <li key={i} className="text-xs text-emerald-800">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <h4 className="mb-2 text-sm font-bold text-red-700">
              ⛔ Restricted (Don&apos;ts)
            </h4>
            <ul className="space-y-1">
              {immunity.donts.map((item, i) => (
                <li key={i} className="text-xs text-red-800">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-400">
            This report was generated by WOOFY — Smart Canine Health
            Management System. For professional veterinary advice, please
            consult a licensed veterinarian.
          </p>
          <p className="mt-1 text-[10px] text-gray-300">
            Report ID: {treatment._id} | © {new Date().getFullYear()} WOOFY
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
