"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Thermometer,
  Activity,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
export interface IoTConnectionCardProps {
  /** Whether the belt is connected */
  connected: boolean;
  /** Current heart rate reading */
  heartRate: number | null;
  /** Current dog temperature reading */
  dogTemp: number | null;
  /** Current ambient temperature reading */
  ambientTemp: number | null;
  /** Current activity level */
  activityLevel: string | null;
  /** Battery level (0-100) */
  batteryLevel?: number;
  /** Signal strength (0-100) */
  signalStrength?: number;
  /** ISO timestamp of last sync */
  lastSyncedAt?: string | null;
  /** Toggle connection callback — shows connect/disconnect button */
  onToggle?: () => void;
  /** Link to navigate for belt management when onToggle is absent */
  dashboardLink?: string;
}

/* ------------------------------------------------------------------ */
/*  Mini Gauge                                                         */
/* ------------------------------------------------------------------ */
function MiniGauge({
  icon: Icon,
  label,
  value,
  unit,
  color,
  warningLow,
  warningHigh,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  color: string;
  warningLow?: number;
  warningHigh?: number;
}) {
  const isWarning =
    (warningLow !== undefined && value < warningLow) ||
    (warningHigh !== undefined && value > warningHigh);

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        isWarning
          ? "border-destructive/50 bg-destructive/5"
          : "border-border/60 bg-muted/20"
      }`}
    >
      <div className={`rounded-lg p-2 ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-lg font-bold tabular-nums leading-tight">
          {value}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        </p>
      </div>
      {isWarning && (
        <span className="ml-auto text-[10px] font-medium text-destructive">
          ⚠
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function IoTConnectionCard({
  connected,
  heartRate,
  dogTemp,
  ambientTemp,
  activityLevel,
  batteryLevel,
  signalStrength,
  lastSyncedAt,
  onToggle,
  dashboardLink,
}: IoTConnectionCardProps) {
  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        connected
          ? "border-emerald-500/40 bg-emerald-500/2"
          : "border-border bg-card"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Radio
              className={`h-4 w-4 ${
                connected ? "text-emerald-500" : "text-muted-foreground"
              }`}
            />
            Smart IoT Belt
          </CardTitle>

          <div className="flex items-center gap-3">
            {/* Battery / Signal badges */}
            {connected && batteryLevel !== undefined && (
              <div className="hidden items-center gap-2 sm:flex">
                <Badge variant="outline" className="gap-1 text-xs">
                  <Battery className="h-3 w-3" />
                  {Math.round(batteryLevel)}%
                </Badge>
                {signalStrength !== undefined && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Signal className="h-3 w-3" />
                    {signalStrength}%
                  </Badge>
                )}
              </div>
            )}

            {/* Connection status indicator */}
            <AnimatePresence mode="wait">
              {connected ? (
                <motion.div
                  key="on"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
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
                  key="off"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex items-center gap-1.5"
                >
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                  <span className="text-sm text-muted-foreground">
                    Disconnected
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle button or dashboard link */}
            {onToggle ? (
              <Button
                variant={connected ? "destructive" : "default"}
                size="sm"
                onClick={onToggle}
                className="gap-1.5"
              >
                {connected ? (
                  <>
                    <WifiOff className="h-3.5 w-3.5" /> Disconnect
                  </>
                ) : (
                  <>
                    <Wifi className="h-3.5 w-3.5" /> Connect Belt
                  </>
                )}
              </Button>
            ) : dashboardLink && !connected ? (
              <Button
                variant="default"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <Link href={dashboardLink}>
                  <Wifi className="h-3.5 w-3.5" /> Connect on Dashboard
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
        <CardDescription>
          {connected
            ? "Real-time sensor data streaming from the canine IoT belt"
            : "Connect the IoT belt on the Health Dashboard to stream vitals"}
        </CardDescription>
      </CardHeader>

      {/* Live sensor readings */}
      <AnimatePresence>
        {connected && heartRate !== null && dogTemp !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-0">
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniGauge
                  icon={Heart}
                  label="Heart Rate"
                  value={heartRate}
                  unit="bpm"
                  color="bg-rose-500"
                  warningLow={50}
                  warningHigh={160}
                />
                <MiniGauge
                  icon={Thermometer}
                  label="Dog Temp"
                  value={dogTemp}
                  unit="°C"
                  color="bg-orange-500"
                  warningLow={37.5}
                  warningHigh={39.5}
                />
                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="rounded-lg bg-violet-500 p-2">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Activity
                    </p>
                    <Badge
                      variant={
                        activityLevel === "Running"
                          ? "destructive"
                          : activityLevel === "Walking"
                            ? "default"
                            : "secondary"
                      }
                      className="mt-0.5"
                    >
                      {activityLevel}
                    </Badge>
                  </div>
                  {ambientTemp !== null && (
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-muted-foreground">
                        Ambient
                      </p>
                      <p className="text-sm font-semibold tabular-nums">
                        {ambientTemp}°C
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {lastSyncedAt && (
                <p className="mt-2 text-right text-[11px] text-muted-foreground tabular-nums">
                  Last sync:{" "}
                  {new Date(lastSyncedAt).toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
