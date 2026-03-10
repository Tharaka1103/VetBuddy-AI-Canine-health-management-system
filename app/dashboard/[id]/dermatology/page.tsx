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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  ArrowLeft,
  Upload,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Camera,
  Stethoscope,
  Heart,
  Thermometer,
  Calendar,
  MapPin,
  FileWarning,
  ArrowRight,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useBeltFromLocalStorage } from "@/hooks/use-belt-simulator";
import { IoTConnectionCard } from "@/components/iot-connection-card";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Canine {
  _id: string;
  name: string;
  breedSize: string;
  age: number;
}

interface DiagnosisResult {
  status: string;
  disease?: string;
  confidence?: number;
  severity?: string;
  affected_area_percentage?: number;
  message?: string;
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
  progressLogs: {
    _id?: string;
    date: string;
    imageUrl: string;
    affectedAreaPercentage: number;
    heartRate?: number;
    temperature?: number;
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Severity Badge                                                     */
/* ------------------------------------------------------------------ */
function SeverityBadge({ level }: { level: string }) {
  const variants: Record<string, string> = {
    Mild: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
    Moderate:
      "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
    Severe:
      "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400",
  };
  return (
    <Badge variant="outline" className={`${variants[level] || ""} font-medium`}>
      {level === "Severe" && <ShieldAlert className="mr-1 h-3 w-3" />}
      {level === "Moderate" && <AlertTriangle className="mr-1 h-3 w-3" />}
      {level === "Mild" && <ShieldCheck className="mr-1 h-3 w-3" />}
      {level}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    Diagnosed:
      "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
    "In Treatment":
      "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
    Recovered:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
  };
  return (
    <Badge variant="outline" className={`${variants[status] || ""} font-medium`}>
      {status}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Confidence Bar                                                     */
/* ------------------------------------------------------------------ */
function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 90
      ? "bg-emerald-500"
      : pct >= 75
        ? "bg-primary"
        : pct >= 65
          ? "bg-amber-500"
          : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">AI Confidence</span>
        <span className="font-medium tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function DermatologyHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // IoT Belt data from localStorage
  const belt = useBeltFromLocalStorage(2000);

  // Dog data
  const [canine, setCanine] = useState<Canine | null>(null);
  const [loading, setLoading] = useState(true);

  // Diagnosis state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  // Treatments
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [savingTreatment, setSavingTreatment] = useState(false);

  /* ---- Fetch canine and treatments ---- */
  const fetchData = useCallback(async () => {
    try {
      const [canineRes, treatmentRes] = await Promise.all([
        fetch(`/api/canines/${id}`),
        fetch(`/api/health/treatments?canineId=${id}`),
      ]);
      if (canineRes.ok) {
        const cd = await canineRes.json();
        setCanine(cd.canine);
      }
      if (treatmentRes.ok) {
        const td = await treatmentRes.json();
        setTreatments(td.treatments);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- Convert File → base64 data URL ---- */
  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  /* ---- File selection ---- */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setSelectedFile(file);
    const dataUrl = await fileToDataUrl(file);
    setPreviewUrl(dataUrl);
    setDiagnosis(null);
  };

  /* ---- AI Diagnosis ---- */
  const handleDiagnose = async () => {
    if (!selectedFile) return;
    setDiagnosing(true);
    setDiagnosis(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/health/skin-disease", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      setDiagnosis(result);

      if (result.status === "success" && result.disease !== "Healthy") {
        toast.success(`Disease identified: ${result.disease}`);
      } else if (result.status === "success" && result.disease === "Healthy") {
        toast.success("No skin diseases detected!");
      } else if (result.status === "warning") {
        toast.warning(result.message);
      } else if (result.status === "error") {
        toast.error(result.message || result.error);
      }
    } catch {
      toast.error(
        "Failed to analyze image. Make sure the AI server is running."
      );
    } finally {
      setDiagnosing(false);
    }
  };

  /* ---- Start Treatment (captures belt vitals from localStorage) ---- */
  const handleStartTreatment = async () => {
    if (
      !diagnosis ||
      diagnosis.status !== "success" ||
      diagnosis.disease === "Healthy"
    )
      return;

    setSavingTreatment(true);
    try {
      const res = await fetch("/api/health/treatments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canineId: id,
          diseaseName: diagnosis.disease!,
          confidence: diagnosis.confidence!,
          initialSeverityLevel: diagnosis.severity!,
          initialAffectedArea: diagnosis.affected_area_percentage!,
          initialImageUrl: previewUrl || "",
          initialHeartRate: belt.heartRate ?? undefined,
          initialTemperature: belt.dogTemp ?? undefined,
        }),
      });

      if (res.ok) {
        const { treatment } = await res.json();
        setTreatments((prev) => [treatment, ...prev]);
        setDiagnosis(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        toast.success(
          "Treatment record created with baseline vitals! Visit a vet for guidance."
        );
        router.push(
          `/dashboard/${id}/dermatology/treatment/${treatment._id}`
        );
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create treatment");
      }
    } catch {
      toast.error("Failed to save treatment record");
    } finally {
      setSavingTreatment(false);
    }
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="mb-6 h-40 rounded-xl" />
        <Skeleton className="mb-6 h-80 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!canine) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Dog not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
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
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Dermatology — {canine.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              AI skin disease identifier &amp; treatment tracker
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* ================================================================ */}
        {/*  IoT BELT STATUS — read from localStorage                       */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
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
        {/*  BELT NOT CONNECTED WARNING                                     */}
        {/* ================================================================ */}
        {!belt.connected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Smart Belt Required</AlertTitle>
              <AlertDescription>
                Please connect the Smart Belt to capture live vitals before
                analyzing skin conditions. Navigate to the{" "}
                <Link
                  href={`/dashboard/${id}`}
                  className="font-semibold underline"
                >
                  Health Dashboard
                </Link>{" "}
                to connect your IoT belt.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/*  SKIN DISEASE SCANNER                                           */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Skin Disease Scanner
              </CardTitle>
              <CardDescription>
                Upload a clear photo of the affected area for AI-powered
                analysis
                {belt.connected && (
                  <span className="ml-1 font-medium text-emerald-600 dark:text-emerald-400">
                    — Vitals will be captured automatically from the belt
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Zone — disabled when belt disconnected */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className={`absolute inset-0 z-10 h-full w-full opacity-0 ${
                    belt.connected
                      ? "cursor-pointer"
                      : "pointer-events-none cursor-not-allowed"
                  }`}
                  id="skin-image-upload"
                  disabled={!belt.connected}
                />
                <div
                  className={`flex min-h-50 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                    !belt.connected
                      ? "border-muted bg-muted/20 opacity-50"
                      : previewUrl
                        ? "border-primary/30 bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  {previewUrl ? (
                    <div className="relative w-full p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Selected dog skin image"
                        className="mx-auto max-h-64 rounded-lg object-contain"
                      />
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-8">
                      <div className="rounded-full bg-muted p-4">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {belt.connected
                            ? "Click or drag to upload"
                            : "Upload disabled — connect belt first"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          JPG, PNG or WebP — max 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Captured belt vitals preview */}
              {belt.connected && selectedFile && (
                <div className="flex items-center gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Belt Vitals Captured:
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

              {/* Analyze Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleDiagnose}
                disabled={!selectedFile || diagnosing || !belt.connected}
              >
                {diagnosing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Analyze Skin Condition
                  </>
                )}
              </Button>

              {/* AI Pipeline Steps */}
              {diagnosing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-4"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    AI Pipeline:
                  </p>
                  {[
                    "Validating dog image (MobileNetV2)...",
                    "Classifying skin disease (DenseNet121)...",
                    "Checking confidence threshold...",
                    "Calculating severity via color masking...",
                    "Fusing vitals from IoT Belt...",
                  ].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.5 }}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      {step}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ================================================================ */}
        {/*  DIAGNOSIS RESULT                                               */}
        {/* ================================================================ */}
        <AnimatePresence>
          {diagnosis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                className={`border-2 ${
                  diagnosis.status === "success" &&
                  diagnosis.disease !== "Healthy"
                    ? "border-destructive/30 bg-destructive/5"
                    : diagnosis.status === "success"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : diagnosis.status === "warning"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-destructive/30"
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    {diagnosis.status === "success" &&
                      diagnosis.disease !== "Healthy" && (
                        <>
                          <ShieldAlert className="h-5 w-5 text-destructive" />
                          Disease Detected
                        </>
                      )}
                    {diagnosis.status === "success" &&
                      diagnosis.disease === "Healthy" && (
                        <>
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                          All Clear!
                        </>
                      )}
                    {diagnosis.status === "warning" && (
                      <>
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Low Confidence Warning
                      </>
                    )}
                    {diagnosis.status === "error" && (
                      <>
                        <FileWarning className="h-5 w-5 text-destructive" />
                        Invalid Image
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Disease detected */}
                  {diagnosis.status === "success" &&
                    diagnosis.disease !== "Healthy" && (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-lg border border-border/60 bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                              Identified Disease
                            </p>
                            <p className="mt-1 text-lg font-bold text-destructive">
                              {diagnosis.disease}
                            </p>
                          </div>
                          <div className="rounded-lg border border-border/60 bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                              Affected Area
                            </p>
                            <p className="mt-1 text-lg font-bold tabular-nums">
                              {diagnosis.affected_area_percentage}%
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            {diagnosis.confidence !== undefined && (
                              <ConfidenceBar confidence={diagnosis.confidence} />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Severity:
                            </span>
                            {diagnosis.severity && (
                              <SeverityBadge level={diagnosis.severity} />
                            )}
                          </div>
                        </div>

                        {/* Baseline vitals from belt */}
                        {belt.connected && (
                          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                            <p className="mb-2 text-xs font-medium text-primary">
                              IoT Belt Baseline Vitals (saved with treatment)
                            </p>
                            <div className="flex gap-4">
                              <Badge variant="outline" className="gap-1">
                                <Heart className="h-3 w-3 text-rose-500" />
                                {belt.heartRate} bpm
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Thermometer className="h-3 w-3 text-orange-500" />
                                {belt.dogTemp}°C
                              </Badge>
                            </div>
                          </div>
                        )}

                        <Separator />

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button
                            onClick={handleStartTreatment}
                            disabled={savingTreatment}
                            className="flex-1"
                          >
                            {savingTreatment ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Stethoscope className="mr-2 h-4 w-4" />
                            )}
                            Start Treatment Tracking
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            asChild
                          >
                            <Link href="/dashboard/clinics">
                              <MapPin className="mr-2 h-4 w-4" />
                              Find Nearest Vet Clinics
                            </Link>
                          </Button>
                        </div>
                      </>
                    )}

                  {/* Healthy */}
                  {diagnosis.status === "success" &&
                    diagnosis.disease === "Healthy" && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {diagnosis.message ||
                          "No skin diseases detected! Your dog's skin looks healthy."}
                      </p>
                    )}

                  {/* Warning */}
                  {diagnosis.status === "warning" && (
                    <div className="space-y-3">
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        {diagnosis.message}
                      </p>
                      {diagnosis.disease && (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                          <p className="text-xs text-muted-foreground">
                            Possible Condition
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
                            {diagnosis.disease}
                          </p>
                        </div>
                      )}
                      {diagnosis.confidence !== undefined && (
                        <ConfidenceBar confidence={diagnosis.confidence} />
                      )}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard/clinics">
                          <MapPin className="mr-2 h-4 w-4" />
                          Find Nearest Vet Clinics
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Error */}
                  {diagnosis.status === "error" && (
                    <p className="text-sm text-destructive">
                      {diagnosis.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================ */}
        {/*  DISEASE HISTORY GRID                                           */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-primary" />
                Disease History
              </h2>
              <Badge variant="secondary" className="text-xs">
                {treatments.length} record
                {treatments.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {treatments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Stethoscope className="mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No skin disease history yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload and analyze a skin image above to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {treatments.map((t, idx) => (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <Card className="group relative overflow-hidden border-border/60 transition-shadow hover:shadow-md">
                      {/* Status indicator stripe */}
                      <div
                        className={`absolute inset-y-0 left-0 w-1 ${
                          t.status === "Recovered"
                            ? "bg-emerald-500"
                            : t.status === "In Treatment"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                      />

                      <CardHeader className="pb-2 pl-5">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-semibold leading-tight">
                            {t.diseaseName}
                          </CardTitle>
                          <StatusBadge status={t.status} />
                        </div>
                        <CardDescription className="text-xs">
                          <Calendar className="mr-1 inline h-3 w-3" />
                          {new Date(t.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3 pl-5">
                        {/* Stats */}
                        <div className="flex flex-wrap gap-1.5">
                          <SeverityBadge level={t.initialSeverityLevel} />
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-normal"
                          >
                            {t.initialAffectedArea}% affected
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-normal"
                          >
                            {Math.round(t.confidence * 100)}% conf.
                          </Badge>
                        </div>

                        {/* Baseline vitals */}
                        {(t.initialHeartRate || t.initialTemperature) && (
                          <div className="flex gap-2">
                            {t.initialHeartRate && (
                              <Badge
                                variant="outline"
                                className="gap-0.5 text-[11px] font-normal"
                              >
                                <Heart className="h-2.5 w-2.5 text-rose-500" />
                                {t.initialHeartRate} bpm
                              </Badge>
                            )}
                            {t.initialTemperature && (
                              <Badge
                                variant="outline"
                                className="gap-0.5 text-[11px] font-normal"
                              >
                                <Thermometer className="h-2.5 w-2.5 text-orange-500" />
                                {t.initialTemperature}°C
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Progress count */}
                        {t.progressLogs.length > 0 && (
                          <p className="text-[11px] text-muted-foreground">
                            {t.progressLogs.length} progress log
                            {t.progressLogs.length !== 1 ? "s" : ""}
                          </p>
                        )}

                        <Separator />

                        {/* Navigation button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5"
                          asChild
                        >
                          <Link
                            href={`/dashboard/${id}/dermatology/treatment/${t._id}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details &amp; Track
                            <ArrowRight className="ml-auto h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="flex flex-wrap gap-3 py-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/${id}`}>
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Back to Health Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/clinics">
                  <MapPin className="mr-2 h-3.5 w-3.5" />
                  Find Nearest Vet Clinics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
