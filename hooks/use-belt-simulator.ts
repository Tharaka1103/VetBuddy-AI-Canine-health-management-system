"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface BeltSensorData {
  /** Dog body temperature in °C (normal: 37.5–39.2) */
  dogTemp: number;
  /** Heart rate in BPM (normal: 60–140 depending on size/activity) */
  heartRate: number;
  /** Ambient / environmental temperature in °C */
  ambientTemp: number;
  /** Accelerometer axes (g-force) */
  accelerometer: { x: number; y: number; z: number };
  /** Derived activity level from accelerometer magnitude */
  activityLevel: "Resting" | "Walking" | "Running";
  /** ISO timestamp */
  timestamp: string;
}

export interface BeltStatus {
  connected: boolean;
  batteryLevel: number; // 0-100
  signalStrength: number; // 0-100
  firmwareVersion: string;
  lastSyncedAt: string | null;
}

export interface UseBeltSimulatorReturn {
  /** Whether the simulated belt is "connected" */
  connected: boolean;
  /** Toggle belt connection */
  toggleConnection: () => void;
  /** Current (latest) sensor reading */
  currentData: BeltSensorData | null;
  /** Rolling buffer of recent readings for charting */
  history: BeltSensorData[];
  /** Belt device metadata */
  beltStatus: BeltStatus;
  /** Clear the history buffer */
  clearHistory: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
/** Gaussian-ish random using Box-Muller, clamped */
function gaussRand(mean: number, stdDev: number, min: number, max: number) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.min(max, Math.max(min, mean + z * stdDev));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function deriveActivity(accelMag: number): "Resting" | "Walking" | "Running" {
  if (accelMag < 1.3) return "Resting";
  if (accelMag < 2.5) return "Walking";
  return "Running";
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */
export function useBeltSimulator(
  /** Interval in ms between simulated readings */
  intervalMs = 2000,
  /** Max number of readings to keep in history */
  maxHistory = 60
): UseBeltSimulatorReturn {
  const [connected, setConnected] = useState(false);
  const [currentData, setCurrentData] = useState<BeltSensorData | null>(null);
  const [history, setHistory] = useState<BeltSensorData[]>([]);
  const [battery, setBattery] = useState(95);

  // Track previous values for smooth transitions
  const prevRef = useRef({
    dogTemp: 38.5,
    heartRate: 80,
    ambientTemp: 26,
    accelX: 0,
    accelY: 0,
    accelZ: 1,
  });

  const generateReading = useCallback((): BeltSensorData => {
    const prev = prevRef.current;

    // Smooth random walk with drift toward normal ranges
    const dogTemp = round2(
      prev.dogTemp * 0.85 + gaussRand(38.4, 0.3, 36.5, 41.0) * 0.15
    );
    const heartRate = Math.round(
      prev.heartRate * 0.8 + gaussRand(85, 15, 40, 180) * 0.2
    );
    const ambientTemp = round2(
      prev.ambientTemp * 0.9 + gaussRand(26, 3, 10, 45) * 0.1
    );

    // Accelerometer: occasional bursts of activity
    const activityBurst = Math.random() < 0.1; // 10% chance of activity change
    const accelX = round2(
      activityBurst
        ? gaussRand(0, 1.5, -4, 4)
        : prev.accelX * 0.7 + gaussRand(0, 0.2, -4, 4) * 0.3
    );
    const accelY = round2(
      activityBurst
        ? gaussRand(0, 1.5, -4, 4)
        : prev.accelY * 0.7 + gaussRand(0, 0.2, -4, 4) * 0.3
    );
    const accelZ = round2(
      activityBurst
        ? gaussRand(1, 1.2, -2, 4)
        : prev.accelZ * 0.7 + gaussRand(1, 0.15, -2, 4) * 0.3
    );

    prevRef.current = {
      dogTemp,
      heartRate,
      ambientTemp,
      accelX,
      accelY,
      accelZ,
    };

    const magnitude = Math.sqrt(accelX ** 2 + accelY ** 2 + accelZ ** 2);

    return {
      dogTemp,
      heartRate,
      ambientTemp,
      accelerometer: { x: accelX, y: accelY, z: accelZ },
      activityLevel: deriveActivity(magnitude),
      timestamp: new Date().toISOString(),
    };
  }, []);

  // Start/stop simulation loop
  useEffect(() => {
    if (!connected) return;

    // Emit first reading immediately
    const first = generateReading();
    setCurrentData(first);
    setHistory((h) => [...h.slice(-(maxHistory - 1)), first]);

    const timer = setInterval(() => {
      const reading = generateReading();
      setCurrentData(reading);
      setHistory((h) => [...h.slice(-(maxHistory - 1)), reading]);
      // Drain battery slowly
      setBattery((b) => Math.max(0, b - 0.05));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [connected, intervalMs, maxHistory, generateReading]);

  const toggleConnection = useCallback(() => {
    setConnected((c) => {
      if (c) {
        // Disconnecting — keep history but clear current
        setCurrentData(null);
      } else {
        // Reconnecting — reset battery
        setBattery(95);
      }
      return !c;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const beltStatus: BeltStatus = {
    connected,
    batteryLevel: round2(battery),
    signalStrength: connected ? Math.round(75 + Math.random() * 25) : 0,
    firmwareVersion: "1.4.2",
    lastSyncedAt: currentData?.timestamp ?? null,
  };

  return {
    connected,
    toggleConnection,
    currentData,
    history,
    beltStatus,
    clearHistory,
  };
}
