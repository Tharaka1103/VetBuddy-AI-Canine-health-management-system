"use client";

import { useState, useEffect, useCallback, use, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Dog,
  Thermometer,
  Heart,
  Activity,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Zap,
  Gauge,
  TrendingUp,
  Radio,
  Hospital,
  MapPin,
  Clock,
  Stethoscope,
  Navigation,
  Calendar,
  Star,
  Phone,
  ArrowRight,
  ExternalLink,
  Map,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGsapFadeIn, useGsapPulse } from "@/hooks/use-gsap";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  useBeltSimulator,
  type BeltSensorData,
} from "@/hooks/use-belt-simulator";
import { useLocation } from "@/components/location-provider";
import { RouteMapCard } from "@/components/route-map-card";
import { EmergencyAlertModal } from "@/components/emergency-alert-modal";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Canine {
  _id: string;
  name: string;
  breedSize: string;
  age: number;
}

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

interface NearbyClinic {
  _id: string;
  Center_Name: string;
  Location: string;
  Location_Coords: { type: string; coordinates: [number, number] };
  Facility_Type: string;
  Is_24x7: boolean;
  Specializations: string;
  Average_Rating: number;
  Current_Wait_Time_Mins: number;
  Contact_Number: string;
  distance_km?: number;
}

interface CareAIPrediction {
  urgency_level: string;
  recommended_clinic_type: string;
  ai_message: string;
}

/* ------------------------------------------------------------------ */
/*  Sensor Gauge Card Component                                        */
/* ------------------------------------------------------------------ */
function SensorGauge({
  icon: Icon,
  label,
  value,
  unit,
  color,
  min,
  max,
  warningLow,
  warningHigh,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  color: string;
  min: number;
  max: number;
  warningLow?: number;
  warningHigh?: number;
}) {
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min)) * 100)
  );
  const isWarning =
    (warningLow !== undefined && value < warningLow) ||
    (warningHigh !== undefined && value > warningHigh);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-xl border p-4 transition-colors ${
        isWarning
          ? "border-destructive/50 bg-destructive/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {value}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          </p>
        </div>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      {/* Mini progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full ${
            isWarning ? "bg-destructive" : "bg-primary"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {isWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 flex items-center gap-1 text-xs text-destructive"
        >
          <AlertTriangle className="h-3 w-3" />
          Outside normal range
        </motion.div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Accelerometer Visualization                                        */
/* ------------------------------------------------------------------ */
function AccelerometerCard({ data }: { data: BeltSensorData }) {
  const magnitude = Math.sqrt(
    data.accelerometer.x ** 2 +
      data.accelerometer.y ** 2 +
      data.accelerometer.z ** 2
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-violet-500" />
          Accelerometer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "X", value: data.accelerometer.x, color: "text-red-500" },
            {
              label: "Y",
              value: data.accelerometer.y,
              color: "text-green-500",
            },
            {
              label: "Z",
              value: data.accelerometer.z,
              color: "text-blue-500",
            },
            {
              label: "|M|",
              value: Math.round(magnitude * 100) / 100,
              color: "text-violet-500",
            },
          ].map((axis) => (
            <div key={axis.label} className="text-center">
              <p className={`text-xs font-medium ${axis.color}`}>
                {axis.label}
              </p>
              <p className="text-lg font-bold tabular-nums">{axis.value}</p>
              <p className="text-[10px] text-muted-foreground">g</p>
            </div>
          ))}
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Activity</span>
          <Badge
            variant={
              data.activityLevel === "Running"
                ? "destructive"
                : data.activityLevel === "Walking"
                  ? "default"
                  : "secondary"
            }
          >
            <Activity className="mr-1 h-3 w-3" />
            {data.activityLevel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function DogDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const headerRef = useGsapFadeIn<HTMLDivElement>(0, 0.7);

  const [canine, setCanine] = useState<Canine | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Vitals form
  const [ambientTemp, setAmbientTemp] = useState("28");
  const [dogTemp, setDogTemp] = useState("38.5");
  const [heartRate, setHeartRate] = useState("80");
  const [activityLevel, setActivityLevel] = useState("Resting");
  const [analyzing, setAnalyzing] = useState(false);

  // Latest result
  const [latestResult, setLatestResult] = useState<HealthRecord | null>(null);

  // IoT Belt Simulator
  const belt = useBeltSimulator(2000, 60);
  const [autoFillFromBelt, setAutoFillFromBelt] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const analyzingRef = useRef(false);
  const runAnalysisRef = useRef<(opts?: { silent?: boolean }) => Promise<void>>(undefined);

  // Geolocation
  const { position: userPosition } = useLocation();

  // Care AI state
  const [carePrediction, setCarePrediction] = useState<CareAIPrediction | null>(null);
  const [recommendedClinic, setRecommendedClinic] = useState<NearbyClinic | null>(null);
  const [careLoading, setCareLoading] = useState(false);

  // Emergency modal
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyData, setEmergencyData] = useState({ diagnosis: "", reason: "" });

  const pulseRef = useGsapPulse<HTMLDivElement>(
    latestResult?.aiDiagnosis === "Anomaly"
  );

  /* ---- Auto-fill vitals from belt ---- */
  useEffect(() => {
    if (belt.connected && belt.currentData && autoFillFromBelt) {
      setAmbientTemp(belt.currentData.ambientTemp.toString());
      setDogTemp(belt.currentData.dogTemp.toString());
      setHeartRate(belt.currentData.heartRate.toString());
      setActivityLevel(belt.currentData.activityLevel);
    }
  }, [belt.connected, belt.currentData, autoFillFromBelt]);

  /* ---- Fetch data ---- */
  const fetchData = useCallback(async () => {
    try {
      const [canineRes, healthRes] = await Promise.all([
        fetch(`/api/canines/${id}`),
        fetch(`/api/health?canineId=${id}`),
      ]);

      if (canineRes.ok) {
        const cd = await canineRes.json();
        setCanine(cd.canine);
      }
      if (healthRes.ok) {
        const hd = await healthRes.json();
        setRecords(hd.records);
      }
    } catch {
      toast.error("Failed to load dog data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- Initial care AI call for routine checkup suggestion ---- */
  useEffect(() => {
    if (canine && !carePrediction && !careLoading) {
      fetchCareAI("Healthy", "None");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canine]);

  /* ---- Care AI: fetch urgency & recommended clinic ---- */
  const fetchCareAI = useCallback(
    async (condition: string, severity: string) => {
      if (!canine) return;
      setCareLoading(true);
      try {
        const res = await fetch("/api/clinics/predict-care", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Dog_Age: canine.age,
            Condition: condition,
            Severity: severity,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setCarePrediction({
            urgency_level: data.urgency_level,
            recommended_clinic_type: data.recommended_clinic_type,
            ai_message: data.ai_message,
          });

          // Fetch the best clinic of the recommended type
          let foundClinic = false;

          // 1. Try nearby clinics first (if we have user position)
          if (userPosition) {
            const clinicParams = new URLSearchParams({
              lat: userPosition.lat.toString(),
              lng: userPosition.lng.toString(),
              radius: "100",
              type: data.recommended_clinic_type,
            });
            const clinicRes = await fetch(
              `/api/clinics/nearby?${clinicParams.toString()}`
            );
            if (clinicRes.ok) {
              const clinicData = await clinicRes.json();
              if (clinicData.clinics?.length > 0) {
                setRecommendedClinic(clinicData.clinics[0]);
                foundClinic = true;
              }
            }
          }

          // 2. Fallback: fetch all clinics and pick the best-rated match
          if (!foundClinic) {
            try {
              const allRes = await fetch("/api/clinics");
              if (allRes.ok) {
                const allData = await allRes.json();
                const allClinics = allData.clinics || [];
                // Prefer matching facility type, then best rating
                const matching = allClinics.filter(
                  (c: NearbyClinic) =>
                    c.Facility_Type === data.recommended_clinic_type
                );
                const best =
                  matching.length > 0
                    ? matching[0]
                    : allClinics[0] || null;
                if (best) setRecommendedClinic(best);
              }
            } catch {
              // ignore fallback error
            }
          }
        }
      } catch {
        console.warn("Care AI prediction failed");
      } finally {
        setCareLoading(false);
      }
    },
    [canine, userPosition]
  );

  /* ---- AI Analysis (core logic) ---- */
  const runAnalysis = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (analyzingRef.current) return;
      analyzingRef.current = true;
      setAnalyzing(true);
      if (!opts?.silent) setLatestResult(null);

      try {
        const res = await fetch("/api/health", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            canineId: id,
            ambientTemp: Number(ambientTemp),
            dogTemp: Number(dogTemp),
            heartRate: Number(heartRate),
            activityLevel,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Analysis failed");
        }

        const data = await res.json();
        setLatestResult(data.record);
        setRecords((prev) => [data.record, ...prev]);

        if (data.record.aiDiagnosis === "Anomaly") {
          toast.warning("Anomaly detected! Review the diagnosis below.");

          // Determine condition & severity from reason for care AI
          const reason = data.record.aiReason || "";
          let condition = "Anomaly";
          let severity = "Moderate";
          if (reason.includes("High Temperature") || reason.includes("Fever") || reason.includes("Heat Stroke")) {
            condition = "High Fever";
            severity = "Severe";
          } else if (reason.includes("Low Temperature") || reason.includes("Hypothermia")) {
            condition = "Hypothermia";
            severity = "Severe";
          } else if (reason.includes("High Heart Rate") || reason.includes("Tachycardia")) {
            condition = "Tachycardia";
            severity = "Moderate";
          } else if (reason.includes("Low Heart Rate")) {
            condition = "Bradycardia";
            severity = "Moderate";
          }

          // Call care AI
          fetchCareAI(condition, severity);

          // If severe — open emergency modal
          if (severity === "Severe") {
            setEmergencyData({
              diagnosis: data.record.aiDiagnosis,
              reason: data.record.aiReason,
            });
            setEmergencyOpen(true);
          }
        } else if (!opts?.silent) {
          toast.success("Your dog appears healthy!");
        }
      } catch (err: unknown) {
        if (!opts?.silent) {
          toast.error(err instanceof Error ? err.message : "Analysis failed");
        }
      } finally {
        setAnalyzing(false);
        analyzingRef.current = false;
      }
    },
    [id, ambientTemp, dogTemp, heartRate, activityLevel, fetchCareAI]
  );

  // Keep a ref to the latest runAnalysis so the interval never goes stale
  useEffect(() => {
    runAnalysisRef.current = runAnalysis;
  }, [runAnalysis]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis();
  };

  /* ---- Auto-analyze every 5 seconds ---- */
  useEffect(() => {
    if (!belt.connected || !autoAnalyze) return;

    const interval = setInterval(() => {
      runAnalysisRef.current?.({ silent: true });
    }, 5000);

    // Run once immediately when enabled
    const immediate = setTimeout(() => {
      runAnalysisRef.current?.({ silent: true });
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(immediate);
    };
  }, [belt.connected, autoAnalyze]);

  /* ---- Feedback ---- */
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

      if (!res.ok) throw new Error("Feedback failed");

      setRecords((prev) =>
        prev.map((r) =>
          r._id === recordId ? { ...r, userFeedback: feedback } : r
        )
      );
      if (latestResult?._id === recordId) {
        setLatestResult((prev) =>
          prev ? { ...prev, userFeedback: feedback } : prev
        );
      }

      toast.success(
        feedback === "Correct"
          ? "Thank you! Diagnosis confirmed."
          : "Thanks for the correction — the AI is learning!"
      );
    } catch {
      toast.error("Failed to send feedback");
    }
  };

  /* ---- Chart data (historical) ---- */
  const chartData = [...records].reverse().map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    "Heart Rate": r.heartRate,
    "Dog Temp": r.dogTemp,
  }));

  /* ---- Real-time belt chart data ---- */
  const beltChartData = useMemo(
    () =>
      belt.history.map((r) => ({
        time: new Date(r.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        "Heart Rate": r.heartRate,
        "Dog Temp": r.dogTemp,
        "Ambient Temp": r.ambientTemp,
      })),
    [belt.history]
  );

  const accelChartData = useMemo(
    () =>
      belt.history.map((r) => ({
        time: new Date(r.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        X: r.accelerometer.x,
        Y: r.accelerometer.y,
        Z: r.accelerometer.z,
      })),
    [belt.history]
  );

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="mx-auto space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (!canine) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Dog not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 p-6">
      {/* ---- Header ---- */}
      <div ref={headerRef} className="flex flex-wrap items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{canine.name}</h1>
          <p className="text-muted-foreground">
            {canine.breedSize} breed &middot; {canine.age} year
            {canine.age !== 1 ? "s" : ""} old
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Dog className="mr-1 h-3 w-3" /> {canine.breedSize}
        </Badge>
      </div>

      {/* ================================================================ */}
      {/*  IoT BELT SECTION                                                 */}
      {/* ================================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <Card className="border-2 border-dashed border-primary/30 bg-primary/[0.02]">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary" />
                Dog's Belt
              </CardTitle>
              <div className="flex items-center gap-4">
                {/* Belt status badges */}
                {belt.connected && (
                  <div className="hidden items-center gap-3 sm:flex">
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Battery className="h-3 w-3" />
                      {Math.round(belt.beltStatus.batteryLevel)}%
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Signal className="h-3 w-3" />
                      {belt.beltStatus.signalStrength}%
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      v{belt.beltStatus.firmwareVersion}
                    </Badge>
                  </div>
                )}
                {/* Connect toggle */}
                <div className="flex items-center gap-2">
                  <AnimatePresence mode="wait">
                    {belt.connected ? (
                      <motion.div
                        key="connected"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-1.5"
                      >
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                        </span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          Connected
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="disconnected"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-1.5"
                      >
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                        <span className="text-sm text-muted-foreground">
                          Disconnected
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button
                    variant={belt.connected ? "destructive" : "default"}
                    size="sm"
                    onClick={() => {
                      belt.toggleConnection();
                      toast(
                        belt.connected
                          ? "Belt disconnected"
                          : "Belt connected — streaming sensor data"
                      );
                    }}
                    className="gap-1.5"
                  >
                    {belt.connected ? (
                      <>
                        <WifiOff className="h-3.5 w-3.5" /> Disconnect
                      </>
                    ) : (
                      <>
                        <Wifi className="h-3.5 w-3.5" /> Connect Belt
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <CardDescription>
              {belt.connected
                ? "Real-time sensor data streaming from the canine belt"
                : "Connect the IoT belt to start receiving real-time health metrics"}
            </CardDescription>
          </CardHeader>

          {/* ---- Live Sensor Gauges ---- */}
          <AnimatePresence>
            {belt.connected && belt.currentData && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <CardContent className="space-y-4">
                  {/* Sensor gauge cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SensorGauge
                      icon={Thermometer}
                      label="Dog Temperature"
                      value={belt.currentData.dogTemp}
                      unit="°C"
                      color="bg-orange-500"
                      min={35}
                      max={42}
                      warningLow={37.5}
                      warningHigh={39.5}
                    />
                    <SensorGauge
                      icon={Heart}
                      label="Heart Rate"
                      value={belt.currentData.heartRate}
                      unit="bpm"
                      color="bg-rose-500"
                      min={30}
                      max={200}
                      warningLow={50}
                      warningHigh={160}
                    />
                    <SensorGauge
                      icon={Thermometer}
                      label="Ambient Temperature"
                      value={belt.currentData.ambientTemp}
                      unit="°C"
                      color="bg-sky-500"
                      min={0}
                      max={50}
                      warningHigh={40}
                    />
                    <SensorGauge
                      icon={Zap}
                      label="Accel Magnitude"
                      value={
                        Math.round(
                          Math.sqrt(
                            belt.currentData.accelerometer.x ** 2 +
                              belt.currentData.accelerometer.y ** 2 +
                              belt.currentData.accelerometer.z ** 2
                          ) * 100
                        ) / 100
                      }
                      unit="g"
                      color="bg-violet-500"
                      min={0}
                      max={6}
                      warningHigh={4}
                    />
                  </div>

                  {/* Accelerometer detail + Auto-fill toggle */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AccelerometerCard data={belt.currentData} />
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Belt Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Auto-fill Vitals Form
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Populate the analysis form with live belt data
                            </p>
                          </div>
                          <Switch
                            checked={autoFillFromBelt}
                            onCheckedChange={setAutoFillFromBelt}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Auto AI Analysis
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Run AI diagnosis every 5 seconds
                            </p>
                          </div>
                          <Switch
                            checked={autoAnalyze}
                            onCheckedChange={setAutoAnalyze}
                          />
                        </div>
                        <Separator />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Readings collected
                            </span>
                            <span className="font-medium tabular-nums">
                              {belt.history.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Sampling rate
                            </span>
                            <span className="font-medium">2s interval</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Last synced
                            </span>
                            <span className="font-medium tabular-nums">
                              {belt.beltStatus.lastSyncedAt
                                ? new Date(
                                    belt.beltStatus.lastSyncedAt
                                  ).toLocaleTimeString()
                                : "—"}
                            </span>
                          </div>
                        </div>
                        {belt.history.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              belt.clearHistory();
                              toast("Belt history cleared");
                            }}
                          >
                            Clear History
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* ---- Real-Time Belt Charts ---- */}
      <AnimatePresence>
        {belt.connected && belt.history.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            {/* Heart Rate + Temperature Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Live Vitals Stream
                </CardTitle>
                <CardDescription>
                  Heart rate &amp; temperatures in real time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={beltChartData}>
                    <defs>
                      <linearGradient
                        id="heartGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f43f5e"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f43f5e"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="tempGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f97316"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f97316"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="time"
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      yAxisId="left"
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="Heart Rate"
                      stroke="#f43f5e"
                      fill="url(#heartGrad)"
                      strokeWidth={2}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="Dog Temp"
                      stroke="#f97316"
                      fill="url(#tempGrad)"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Ambient Temp"
                      stroke="#3b82f6"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Accelerometer Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="h-4 w-4 text-violet-500" />
                  Accelerometer Stream
                </CardTitle>
                <CardDescription>
                  X / Y / Z axis movement in real time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={accelChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="time"
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="X"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Y"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Z"
                      stroke="#3b82f6"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Separator />

      {/* ================================================================ */}
      {/*  AI CARE RECOMMENDATION                                           */}
      {/* ================================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-emerald-500" />
                Next Visit Recommendation
              </CardTitle>
              <Link href="/dashboard/clinics">
                <Button variant="outline" size="sm" className="gap-1.5">
                  Browse All Clinics
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              AI-powered care recommendation based on your dog&apos;s health profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            {careLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6 text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Analyzing care needs...
                </span>
              </div>
            ) : carePrediction ? (
              <div className="space-y-5">
                {/* Urgency + AI Advice */}
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Urgency Level
                    </span>
                    <Badge
                      variant={
                        carePrediction.urgency_level
                          .toLowerCase()
                          .includes("emergency")
                          ? "destructive"
                          : carePrediction.urgency_level
                                .toLowerCase()
                                .includes("priority")
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {carePrediction.urgency_level}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Recommended Facility
                    </span>
                    <Badge variant="outline" className="gap-1">
                      <Hospital className="h-3 w-3" />
                      {carePrediction.recommended_clinic_type}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium text-muted-foreground">
                      AI Advice
                    </span>
                    <p className="text-sm leading-relaxed">
                      {carePrediction.ai_message}
                    </p>
                  </div>
                </div>

                {/* Best Care Center Card */}
                {recommendedClinic ? (
                  <div className="rounded-xl border bg-gradient-to-br from-muted/40 to-muted/10 overflow-hidden">
                    <div className="p-4 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Hospital className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm leading-tight">
                              {recommendedClinic.Center_Name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Best match for your visit
                            </p>
                          </div>
                        </div>
                        {recommendedClinic.Is_24x7 && (
                          <Badge className="shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                            24/7
                          </Badge>
                        )}
                      </div>

                      {/* Location */}
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                        {recommendedClinic.Location}
                      </p>

                      {/* Stats Row */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs gap-1 bg-background/60">
                          <Star className="h-3 w-3 text-amber-500" />
                          {recommendedClinic.Average_Rating?.toFixed(1) ?? "N/A"} Rating
                        </Badge>
                        <Badge variant="outline" className="text-xs gap-1 bg-background/60">
                          <Clock className="h-3 w-3 text-blue-500" />
                          ~{recommendedClinic.Current_Wait_Time_Mins ?? "?"} min wait
                        </Badge>
                        {recommendedClinic.distance_km !== undefined && (
                          <Badge variant="outline" className="text-xs gap-1 bg-background/60">
                            <Navigation className="h-3 w-3 text-violet-500" />
                            {recommendedClinic.distance_km.toFixed(1)} km away
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs gap-1">
                          {recommendedClinic.Facility_Type}
                        </Badge>
                      </div>

                      {/* Specializations */}
                      {recommendedClinic.Specializations && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <span className="font-medium text-foreground">Specializations:</span>{" "}
                          {recommendedClinic.Specializations}
                        </p>
                      )}

                      {/* Contact */}
                      {recommendedClinic.Contact_Number && (
                        <a
                          href={`tel:${recommendedClinic.Contact_Number}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {recommendedClinic.Contact_Number}
                        </a>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Link href={`/dashboard/clinics/${recommendedClinic._id}`}>
                          <Button size="sm" className="gap-1.5">
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Full Details
                          </Button>
                        </Link>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${recommendedClinic.Location_Coords.coordinates[1]},${recommendedClinic.Location_Coords.coordinates[0]}&travelmode=driving`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Map className="h-3.5 w-3.5" />
                            View on Maps
                          </Button>
                        </a>
                        {recommendedClinic.Contact_Number && (
                          <a href={`tel:${recommendedClinic.Contact_Number}`}>
                            <Button variant="outline" size="sm" className="gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              Call Now
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Inline Route Map */}
                    {recommendedClinic.Location_Coords && (
                      <div className="border-t">
                        <RouteMapCard
                          origin={
                            userPosition || {
                              lat: recommendedClinic.Location_Coords.coordinates[1],
                              lng: recommendedClinic.Location_Coords.coordinates[0],
                            }
                          }
                          destination={{
                            lat: recommendedClinic.Location_Coords.coordinates[1],
                            lng: recommendedClinic.Location_Coords.coordinates[0],
                          }}
                          destinationName={recommendedClinic.Center_Name}
                          compact
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-6 text-center">
                    <Hospital className="mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No matching care center found.
                    </p>
                    <Link href="/dashboard/clinics" className="mt-2">
                      <Button variant="link" size="sm" className="gap-1 text-xs">
                        Browse all clinics <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No care recommendation available yet.
                  <br />
                  Run an analysis to get AI-powered care suggestions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* ================================================================ */}
      {/*  AI ANALYSIS SECTION                                              */}
      {/* ================================================================ */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ---- Vitals Form ---- */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Live Vitals Input
              </CardTitle>
              <CardDescription>
                {belt.connected && autoFillFromBelt
                  ? "Auto-populated from belt sensors — edit if needed"
                  : "Enter sensor readings or simulate vitals data"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAnalyze} className="space-y-4">
                {belt.connected && autoFillFromBelt && (
                  <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                    <Wifi className="h-3.5 w-3.5" />
                    Values auto-filled from belt sensor data
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="ambientTemp"
                      className="flex items-center gap-1"
                    >
                      <Thermometer className="h-3 w-3" /> Ambient Temp (&deg;C)
                    </Label>
                    <Input
                      id="ambientTemp"
                      type="number"
                      step="0.1"
                      value={ambientTemp}
                      onChange={(e) => setAmbientTemp(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="dogTemp"
                      className="flex items-center gap-1"
                    >
                      <Thermometer className="h-3 w-3" /> Dog Temp (&deg;C)
                    </Label>
                    <Input
                      id="dogTemp"
                      type="number"
                      step="0.1"
                      value={dogTemp}
                      onChange={(e) => setDogTemp(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="heartRate"
                      className="flex items-center gap-1"
                    >
                      <Heart className="h-3 w-3" /> Heart Rate (BPM)
                    </Label>
                    <Input
                      id="heartRate"
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Activity Level</Label>
                    <Select
                      value={activityLevel}
                      onValueChange={setActivityLevel}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Resting">Resting</SelectItem>
                        <SelectItem value="Walking">Walking</SelectItem>
                        <SelectItem value="Running">Running</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={analyzing}>
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Run AI Analysis"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* ---- AI Results ---- */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>AI Diagnosis Result</CardTitle>
              <CardDescription>
                Explainable AI prediction with reasoning
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-center">
              <AnimatePresence mode="wait">
                {latestResult ? (
                  <motion.div
                    key={latestResult._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                  >
                    {/* Status indicator */}
                    <div
                      ref={pulseRef}
                      className={`rounded-xl border p-6 text-center ${
                        latestResult.aiDiagnosis === "Anomaly"
                          ? "border-destructive/40 bg-destructive/5"
                          : "border-primary/40 bg-primary/5"
                      }`}
                    >
                      {latestResult.aiDiagnosis === "Anomaly" ? (
                        <>
                          <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
                          <h3 className="mt-2 text-xl font-bold text-destructive">
                            Anomaly Detected
                          </h3>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mx-auto h-10 w-10 text-primary" />
                          <h3 className="mt-2 text-xl font-bold text-primary">
                            Healthy
                          </h3>
                        </>
                      )}
                      {latestResult.aiReason && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {latestResult.aiReason}
                        </p>
                      )}
                    </div>

                    {/* Feedback UI */}
                    {latestResult.aiDiagnosis === "Anomaly" &&
                      latestResult.userFeedback === "Pending" && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Was this diagnosis correct?</AlertTitle>
                          <AlertDescription className="mt-2">
                            Your feedback helps the AI learn and improve.
                            <div className="mt-3 flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleFeedback(latestResult._id, "Correct")
                                }
                              >
                                <CheckCircle className="mr-1 h-4 w-4" /> Yes,
                                Correct
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleFeedback(latestResult._id, "Incorrect")
                                }
                              >
                                <XCircle className="mr-1 h-4 w-4" /> No,
                                Incorrect
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                    {latestResult.userFeedback !== "Pending" && (
                      <p className="text-center text-sm text-muted-foreground">
                        Feedback:{" "}
                        <Badge
                          variant={
                            latestResult.userFeedback === "Correct"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {latestResult.userFeedback}
                        </Badge>
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-8 text-center text-muted-foreground"
                  >
                    <Activity className="mb-3 h-12 w-12 opacity-30" />
                    <p>Submit vitals to get an AI diagnosis</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Separator />

      {/* ---- Historical Chart ---- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Health History</CardTitle>
            <CardDescription>
              Heart rate &amp; temperature over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">
                No records yet. Run an analysis to see data here.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="time"
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="Heart Rate"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Dog Temp"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ---- Records Table ---- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                No health records yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Time</th>
                      <th className="pb-2 pr-4">Dog Temp</th>
                      <th className="pb-2 pr-4">Heart Rate</th>
                      <th className="pb-2 pr-4">Activity</th>
                      <th className="pb-2 pr-4">Diagnosis</th>
                      <th className="pb-2">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 10).map((r) => (
                      <tr key={r._id} className="border-b border-border/50">
                        <td className="py-3 pr-4">
                          {new Date(r.timestamp).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 pr-4">{r.dogTemp}&deg;C</td>
                        <td className="py-3 pr-4">{r.heartRate} bpm</td>
                        <td className="py-3 pr-4">{r.activityLevel}</td>
                        <td className="py-3 pr-4">
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
                        <td className="py-3">
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
                            <span className="text-xs text-muted-foreground">
                              {r.userFeedback}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Emergency Alert Modal */}
      <EmergencyAlertModal
        open={emergencyOpen}
        onOpenChange={setEmergencyOpen}
        dogName={canine?.name ?? "Your dog"}
        diagnosis={emergencyData.diagnosis}
        reason={emergencyData.reason}
        userPosition={userPosition}
      />
    </div>
  );
}
