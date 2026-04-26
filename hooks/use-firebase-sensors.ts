"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ref, onValue, off, Database } from "firebase/database";
import { db } from "@/lib/firebase";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface BeltSensorData {
  /** Dog body temperature in °C (normal: 37.5–39.2) */
  dogTemp: number;
  /** Heart rate in BPM (normal: 60–140 depending on size/activity) */
  heartRate: number;
  /** SpO2 percentage */
  spo2: number;
  /** Ambient / environmental temperature in °C */
  ambientTemp: number;
  /** Accelerometer axes (g-force) */
  accelerometer: { x: number; y: number; z: number };
  /** Derived activity level from accelerometer magnitude */
  activityLevel: "Resting" | "Walking" | "Running";
  /** GPS coordinates */
  gps: { lat: number; lng: number };
  /** ISO timestamp */
  timestamp: string;
}

export interface BeltStatus {
  connected: boolean;
  batteryLevel: number; // 0-100
  signalStrength: number; // 0-100
  firmwareVersion: string;
  lastSyncedAt: string | null;
  sensorStatus: {
    heartrate: "online" | "offline" | "unknown";
    temperature: "online" | "offline" | "unknown";
    gps: "online" | "offline" | "unknown";
    accelerometer: "online" | "offline" | "unknown";
  };
  // Real-time belt status from Firebase /status
  beltOnline: boolean;
  uptime: string | null;
  currentMode: number | null;
  // Physical belt on/off state from Firebase /sensors/belt
  beltPhysicalOn: boolean;
  beltStatus: "on" | "off";
}

export interface UseFirebaseSensorsReturn {
  /** Whether the belt is connected (has received data) */
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
export function useFirebaseSensors(
  /** Max number of readings to keep in history */
  maxHistory = 60
): UseFirebaseSensorsReturn {
  console.log("[FirebaseSensors] Hook initialized with maxHistory:", maxHistory);
  
  const [connected, setConnected] = useState(false);
  const [currentData, setCurrentData] = useState<BeltSensorData | null>(null);
  const [history, setHistory] = useState<BeltSensorData[]>([]);
  const [battery, setBattery] = useState(95);

  // Refs to track Firebase listeners
  const listenersRef = useRef<{
    heartrate: (() => void) | null;
    temperature: (() => void) | null;
    gps: (() => void) | null;
    accel: (() => void) | null;
    status: (() => void) | null;
    belt: (() => void) | null;
  }>({
    heartrate: null,
    temperature: null,
    gps: null,
    accel: null,
    status: null,
    belt: null,
  });

  // Refs to store latest sensor values
  const sensorValuesRef = useRef({
    avgBpm: 0,
    spo2: 0,
    objectTemp: 0,
    ambientTemp: 0,
    lat: 0,
    lng: 0,
    ax: 0,
    ay: 0,
    az: 0,
  });

  // Refs to track sensor online/offline status
  const sensorStatusRef = useRef({
    heartrate: "unknown" as "online" | "offline" | "unknown",
    temperature: "unknown" as "online" | "offline" | "unknown",
    gps: "unknown" as "online" | "offline" | "unknown",
    accelerometer: "unknown" as "online" | "offline" | "unknown",
  });

  // Refs to track belt status from Firebase /status
  const beltStatusRef = useRef({
    online: false,
    uptime: null as string | null,
    currentMode: null as number | null,
  });

  // Refs to track belt sensor status from Firebase /sensors/belt
  const beltSensorRef = useRef({
    status: "off" as "on" | "off",
    beltOn: false,
  });

  // Ref to track last activity time for timeout detection
  const lastActivityRef = useRef(Date.now());
  const BELT_TIMEOUT_MS = 30000; // 30 seconds timeout
  const timeoutCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Combine all sensor values into a single reading
  const updateSensorData = useCallback(() => {
    const values = sensorValuesRef.current;
    
    // Check if we have valid data (all sensors should have non-zero values or be explicitly set)
    const hasValidData = 
      values.avgBpm > 0 || 
      values.objectTemp > 0 || 
      values.lat !== 0 || 
      values.ax !== 0;

    if (!hasValidData) return;

    const magnitude = Math.sqrt(values.ax ** 2 + values.ay ** 2 + values.az ** 2);

    const reading: BeltSensorData = {
      dogTemp: values.objectTemp || 0,
      heartRate: values.avgBpm || 0,
      spo2: values.spo2 || 0,
      ambientTemp: values.ambientTemp || 0,
      accelerometer: { x: values.ax, y: values.ay, z: values.az },
      activityLevel: deriveActivity(magnitude),
      gps: { lat: values.lat, lng: values.lng },
      timestamp: new Date().toISOString(),
    };

    setCurrentData(reading);
    setHistory((h) => [...h.slice(-(maxHistory - 1)), reading]);
    setConnected(true);
  }, [maxHistory]);

  // Setup Firebase listeners
  useEffect(() => {
    console.log("[FirebaseSensors] Setting up listeners, connected:", connected, "window:", typeof window !== "undefined");
    
    if (typeof window === "undefined") {
      console.log("[FirebaseSensors] Skipping listener setup - server-side");
      return;
    }

    // Cleanup previous listeners
    console.log("[FirebaseSensors] Cleaning up previous listeners");
    Object.values(listenersRef.current).forEach(unsubscribe => {
      if (unsubscribe) unsubscribe();
    });

    try {
      console.log("[FirebaseSensors] Setting up Firebase listeners...");
      
      // Belt status listener: /status (always active, independent of connected state)
      console.log("[FirebaseSensors] Setting up belt status listener at /status");
      const statusRef = ref(db, "status");
      const statusUnsubscribe = onValue(statusRef, (snapshot: any) => {
        const data = snapshot.val();
        console.log("[FirebaseSensors] Belt status data received:", data);
        if (data) {
          lastActivityRef.current = Date.now(); // Update activity timestamp
          beltStatusRef.current.online = data.online || false;
          beltStatusRef.current.uptime = data.uptime || null;
          beltStatusRef.current.currentMode = data.currentMode || null;
          
          // If ESP32 is online, consider belt physically ON
          if (data.online) {
            beltSensorRef.current.beltOn = true;
            beltSensorRef.current.status = "on";
          }
          
          console.log("[FirebaseSensors] Belt online status:", data.online, "Current connected state:", connected);
          // Update connection state based on belt online status
          if (data.online && !connected) {
            console.log("[FirebaseSensors] Belt is online, setting connected to true");
            setConnected(true);
          } else if (!data.online && connected) {
            console.log("[FirebaseSensors] Belt is offline, setting connected to false");
            setConnected(false);
          }
        } else {
          console.log("[FirebaseSensors] Belt status data is null/undefined");
        }
      }, (error: any) => {
        console.error("[FirebaseSensors] Belt status error:", error);
      });
      listenersRef.current.status = () => off(statusRef);

      // Belt physical state listener: /sensors/belt (always active)
      // Note: We now use ESP32 online status to determine belt ON state, not GPIO 5
      console.log("[FirebaseSensors] Setting up belt physical state listener at /sensors/belt");
      const beltRef = ref(db, "sensors/belt");
      const beltUnsubscribe = onValue(beltRef, (snapshot: any) => {
        const data = snapshot.val();
        console.log("[FirebaseSensors] Belt physical state snapshot exists:", snapshot.exists());
        console.log("[FirebaseSensors] Belt physical state data received:", JSON.stringify(data));
        if (data) {
          // Only use physical state for debugging, don't override ESP32 online status
          beltSensorRef.current.status = data.status || "off";
          // beltOn is now controlled by ESP32 online status, not this GPIO
          console.log("[FirebaseSensors] Belt physical state - status:", data.status, "beltOn (from GPIO):", data.beltOn, "beltOn (actual):", beltSensorRef.current.beltOn);
        } else {
          console.log("[FirebaseSensors] Belt physical state data is null/undefined");
        }
      }, (error: any) => {
        console.error("[FirebaseSensors] Belt physical state error:", error);
        console.error("[FirebaseSensors] Error code:", error.code);
        console.error("[FirebaseSensors] Error message:", error.message);
      });
      listenersRef.current.belt = () => off(beltRef);

      // Timeout check: if no activity for BELT_TIMEOUT_MS, consider belt off
      timeoutCheckRef.current = setInterval(() => {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        if (timeSinceLastActivity > BELT_TIMEOUT_MS && beltStatusRef.current.online) {
          console.log("[FirebaseSensors] Belt timeout detected - no activity for", timeSinceLastActivity, "ms");
          beltStatusRef.current.online = false;
          beltSensorRef.current.beltOn = false;
          beltSensorRef.current.status = "off";
          setConnected(false);
          setCurrentData(null);
        }
      }, 5000); // Check every 5 seconds

      // Only set up sensor listeners when connected
      if (connected) {
        // Heart rate listener: /sensors/heartrate
        console.log("[FirebaseSensors] Setting up heartrate listener at /sensors/heartrate");
        const heartrateRef = ref(db, "sensors/heartrate");
        const heartrateUnsubscribe = onValue(heartrateRef, (snapshot: any) => {
          const data = snapshot.val();
          console.log("[FirebaseSensors] Heart rate data received:", data);
          if (data) {
            lastActivityRef.current = Date.now(); // Update activity timestamp
            sensorValuesRef.current.avgBpm = data.avgBpm || 0;
            sensorValuesRef.current.spo2 = data.spo2 || 0;
            sensorStatusRef.current.heartrate = "online";
            updateSensorData();
          } else {
            console.log("[FirebaseSensors] Heart rate data is null/undefined");
            sensorStatusRef.current.heartrate = "offline";
          }
        }, (error: any) => {
          console.error("[FirebaseSensors] Heart rate sensor error:", error);
          sensorStatusRef.current.heartrate = "offline";
        });
        listenersRef.current.heartrate = () => off(heartrateRef);

        // Temperature listener: /sensors/temperature/mlx
        console.log("[FirebaseSensors] Setting up temperature listener at /sensors/temperature/mlx");
        const tempRef = ref(db, "sensors/temperature/mlx");
        const tempUnsubscribe = onValue(tempRef, (snapshot: any) => {
          const data = snapshot.val();
          console.log("[FirebaseSensors] Temperature data received:", data);
          if (data) {
            lastActivityRef.current = Date.now(); // Update activity timestamp
            sensorValuesRef.current.objectTemp = data.object || 0;
            sensorValuesRef.current.ambientTemp = data.ambient || 0;
            sensorStatusRef.current.temperature = "online";
            updateSensorData();
          } else {
            console.log("[FirebaseSensors] Temperature data is null/undefined");
            sensorStatusRef.current.temperature = "offline";
          }
        }, (error: any) => {
          console.error("[FirebaseSensors] Temperature sensor error:", error);
          sensorStatusRef.current.temperature = "offline";
        });
        listenersRef.current.temperature = () => off(tempRef);

        // GPS listener: /sensors/gps
        console.log("[FirebaseSensors] Setting up GPS listener at /sensors/gps");
        const gpsRef = ref(db, "sensors/gps");
        const gpsUnsubscribe = onValue(gpsRef, (snapshot: any) => {
          const data = snapshot.val();
          console.log("[FirebaseSensors] GPS data received:", data);
          if (data) {
            lastActivityRef.current = Date.now(); // Update activity timestamp
            sensorValuesRef.current.lat = data.lat || 0;
            sensorValuesRef.current.lng = data.lng || 0;
            sensorStatusRef.current.gps = "online";
            updateSensorData();
          } else {
            console.log("[FirebaseSensors] GPS data is null/undefined");
            sensorStatusRef.current.gps = "offline";
          }
        }, (error: any) => {
          console.error("[FirebaseSensors] GPS sensor error:", error);
          sensorStatusRef.current.gps = "offline";
        });
        listenersRef.current.gps = () => off(gpsRef);

        // Accelerometer listener: /sensors/accel/mpu1
        console.log("[FirebaseSensors] Setting up accelerometer listener at /sensors/accel/mpu1");
        const accelRef = ref(db, "sensors/accel/mpu1");
        const accelUnsubscribe = onValue(accelRef, (snapshot: any) => {
          const data = snapshot.val();
          console.log("[FirebaseSensors] Accelerometer data received:", data);
          if (data) {
            lastActivityRef.current = Date.now(); // Update activity timestamp
            sensorValuesRef.current.ax = data.ax || 0;
            sensorValuesRef.current.ay = data.ay || 0;
            sensorValuesRef.current.az = data.az || 0;
            sensorStatusRef.current.accelerometer = "online";
            updateSensorData();
          } else {
            console.log("[FirebaseSensors] Accelerometer data is null/undefined");
            sensorStatusRef.current.accelerometer = "offline";
          }
        }, (error: any) => {
          console.error("[FirebaseSensors] Accelerometer sensor error:", error);
          sensorStatusRef.current.accelerometer = "offline";
        });
        listenersRef.current.accel = () => off(accelRef);
      } else {
        console.log("[FirebaseSensors] Not connected, skipping sensor listeners");
      }

      console.log("[FirebaseSensors] Firebase listeners set up successfully");

    } catch (error) {
      console.error("[FirebaseSensors] Firebase setup error:", error);
    }

    return () => {
      console.log("[FirebaseSensors] Cleaning up listeners on unmount");
      if (timeoutCheckRef.current) clearInterval(timeoutCheckRef.current);
      Object.values(listenersRef.current).forEach(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [connected, updateSensorData]);

  // Simulate battery drain when connected
  useEffect(() => {
    if (!connected) return;

    const timer = setInterval(() => {
      setBattery((b) => Math.max(0, b - 0.05));
    }, 2000);

    return () => clearInterval(timer);
  }, [connected]);

  const toggleConnection = useCallback(() => {
    console.log("[FirebaseSensors] Toggle connection called, current connected state:", connected);
    setConnected((c) => {
      const newState = !c;
      console.log("[FirebaseSensors] Setting connected to:", newState);
      if (c) {
        // Disconnecting — keep history but clear current
        setCurrentData(null);
      } else {
        // Reconnecting — reset battery
        setBattery(95);
      }
      return newState;
    });
  }, [connected]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // ---- Sync to localStorage for cross-page access ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const isOnline = beltStatusRef.current.online;
      const hasGps = sensorValuesRef.current.lat !== 0 && sensorValuesRef.current.lng !== 0;
      
      console.log("[FirebaseSensors] Syncing to localStorage - isOnline:", isOnline, "hasGps:", hasGps, "lat:", sensorValuesRef.current.lat, "lng:", sensorValuesRef.current.lng);
      
      localStorage.setItem("woofy_belt_connected", JSON.stringify(isOnline));
      
      if (isOnline) {
        // Always sync GPS if available, even if other sensors aren't ready
        if (hasGps) {
          localStorage.setItem("woofy_belt_lat", String(sensorValuesRef.current.lat));
          localStorage.setItem("woofy_belt_lng", String(sensorValuesRef.current.lng));
          console.log("[FirebaseSensors] GPS synced to localStorage:", sensorValuesRef.current.lat, sensorValuesRef.current.lng);
        }
        
        // Sync other sensor data if available
        if (currentData) {
          localStorage.setItem("woofy_belt_heartRate", String(currentData.heartRate));
          localStorage.setItem("woofy_belt_dogTemp", String(currentData.dogTemp));
          localStorage.setItem("woofy_belt_ambientTemp", String(currentData.ambientTemp));
          localStorage.setItem("woofy_belt_activityLevel", currentData.activityLevel);
          localStorage.setItem("woofy_belt_lastSync", currentData.timestamp);
          localStorage.setItem("woofy_belt_spo2", String(currentData.spo2));
        }
      } else {
        localStorage.removeItem("woofy_belt_heartRate");
        localStorage.removeItem("woofy_belt_dogTemp");
        localStorage.removeItem("woofy_belt_ambientTemp");
        localStorage.removeItem("woofy_belt_activityLevel");
        localStorage.removeItem("woofy_belt_lastSync");
        localStorage.removeItem("woofy_belt_spo2");
        localStorage.removeItem("woofy_belt_lat");
        localStorage.removeItem("woofy_belt_lng");
      }
    } catch (error) {
      console.error("[FirebaseSensors] localStorage sync error:", error);
    }
  }, [beltStatusRef.current.online, currentData, sensorValuesRef.current.lat, sensorValuesRef.current.lng]);

  const beltStatus: BeltStatus = {
    connected,
    batteryLevel: round2(battery),
    signalStrength: connected ? Math.round(75 + Math.random() * 25) : 0,
    firmwareVersion: "1.4.2",
    lastSyncedAt: currentData?.timestamp ?? null,
    sensorStatus: sensorStatusRef.current,
    beltOnline: beltStatusRef.current.online,
    uptime: beltStatusRef.current.uptime,
    currentMode: beltStatusRef.current.currentMode,
    beltPhysicalOn: beltSensorRef.current.beltOn,
    beltStatus: beltSensorRef.current.status,
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

/* ------------------------------------------------------------------ */
/*  Read belt data from localStorage (for cross-page access)           */
/* ------------------------------------------------------------------ */
export interface BeltLocalStorageData {
  connected: boolean;
  heartRate: number | null;
  dogTemp: number | null;
  ambientTemp: number | null;
  activityLevel: string | null;
  lastSyncedAt: string | null;
  spo2: number | null;
  lat: number | null;
  lng: number | null;
}

export function useBeltFromLocalStorage(pollMs = 2000): BeltLocalStorageData {
  const [data, setData] = useState<BeltLocalStorageData>({
    connected: false,
    heartRate: null,
    dogTemp: null,
    ambientTemp: null,
    activityLevel: null,
    lastSyncedAt: null,
    spo2: null,
    lat: null,
    lng: null,
  });

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("woofy_belt_connected");
        const connected = raw === "true";
        const hr = localStorage.getItem("woofy_belt_heartRate");
        const dt = localStorage.getItem("woofy_belt_dogTemp");
        const at = localStorage.getItem("woofy_belt_ambientTemp");
        const al = localStorage.getItem("woofy_belt_activityLevel");
        const ls = localStorage.getItem("woofy_belt_lastSync");
        const spo2 = localStorage.getItem("woofy_belt_spo2");
        const lat = localStorage.getItem("woofy_belt_lat");
        const lng = localStorage.getItem("woofy_belt_lng");
        setData({
          connected,
          heartRate: hr ? parseFloat(hr) : null,
          dogTemp: dt ? parseFloat(dt) : null,
          ambientTemp: at ? parseFloat(at) : null,
          activityLevel: al || null,
          lastSyncedAt: ls || null,
          spo2: spo2 ? parseFloat(spo2) : null,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
        });
      } catch {
        /* localStorage unavailable */
      }
    };
    read();
    const timer = setInterval(read, pollMs);
    return () => clearInterval(timer);
  }, [pollMs]);

  return data;
}

/* ------------------------------------------------------------------ */
/*  Direct Firebase GPS listener for sidebar                           */
/* ------------------------------------------------------------------ */
export interface FirebaseGPSData {
  lat: number | null;
  lng: number | null;
  beltOnline: boolean;
  loading: boolean;
  error: string | null;
  gpsFix: boolean;
  satellites: number | null;
  rawGpsData: any;
}

export function useFirebaseGPS(): FirebaseGPSData {
  const [gpsData, setGpsData] = useState<FirebaseGPSData>({
    lat: null,
    lng: null,
    beltOnline: false,
    loading: true,
    error: null,
    gpsFix: false,
    satellites: null,
    rawGpsData: null,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      console.log("[FirebaseGPS] Running on server, skipping Firebase setup");
      return;
    }

    console.log("[FirebaseGPS] Setting up direct GPS listener");
    console.log("[FirebaseGPS] Database instance:", db);

    try {
      // Check if db is available
      if (!db) {
        console.error("[FirebaseGPS] Database instance is null/undefined!");
        setGpsData(prev => ({ ...prev, loading: false, error: "Database not initialized" }));
        return;
      }

      // Listen to belt status
      console.log("[FirebaseGPS] Creating status ref at /status");
      const statusRef = ref(db, "status");
      console.log("[FirebaseGPS] Status ref created:", statusRef);
      
      const statusUnsubscribe = onValue(statusRef, (snapshot: any) => {
        console.log("[FirebaseGPS] Belt status snapshot received, exists:", snapshot.exists());
        const data = snapshot.val();
        console.log("[FirebaseGPS] Belt status data:", data);
        if (data) {
          setGpsData(prev => ({ 
            ...prev, 
            beltOnline: data.online || false, 
            loading: false,
            error: null 
          }));
        } else {
          console.log("[FirebaseGPS] Belt status data is null");
        }
      }, (error: any) => {
        console.error("[FirebaseGPS] Belt status error:", error);
        console.error("[FirebaseGPS] Error code:", error.code);
        console.error("[FirebaseGPS] Error message:", error.message);
        setGpsData(prev => ({ ...prev, loading: false, error: `Status error: ${error.message}` }));
      });

      // Listen to GPS data
      console.log("[FirebaseGPS] Creating GPS ref at /sensors/gps");
      const gpsRef = ref(db, "sensors/gps");
      console.log("[FirebaseGPS] GPS ref created:", gpsRef);
      
      const gpsUnsubscribe = onValue(gpsRef, (snapshot: any) => {
        console.log("[FirebaseGPS] GPS snapshot received, exists:", snapshot.exists());
        const data = snapshot.val();
        console.log("[FirebaseGPS] GPS data:", data);
        
        if (data) {
          const hasFix = data.fix === true;
          const satCount = data.satellites || 0;
          const hasCoords = data.lat && data.lng;
          
          console.log("[FirebaseGPS] GPS fix status:", hasFix, "Satellites:", satCount, "Has coords:", hasCoords);
          console.log("[FirebaseGPS] Raw GPS data:", JSON.stringify(data));
          
          setGpsData(prev => ({
            ...prev,
            lat: data.lat || null,
            lng: data.lng || null,
            gpsFix: hasFix,
            satellites: satCount,
            loading: false,
            error: null,
            rawGpsData: data,
          }));
          
          if (!hasFix) {
            console.log("[FirebaseGPS] GPS searching for satellites, no fix yet. Belt may be indoors or GPS module needs time.");
          } else if (!hasCoords) {
            console.log("[FirebaseGPS] GPS has fix but no coordinates yet");
          }
        } else {
          console.log("[FirebaseGPS] GPS data is null");
        }
      }, (error: any) => {
        console.error("[FirebaseGPS] GPS error:", error);
        console.error("[FirebaseGPS] Error code:", error.code);
        console.error("[FirebaseGPS] Error message:", error.message);
        setGpsData(prev => ({ ...prev, loading: false, error: `GPS error: ${error.message}` }));
      });

      console.log("[FirebaseGPS] Both listeners set up successfully");

      return () => {
        console.log("[FirebaseGPS] Cleaning up listeners");
        off(statusRef);
        off(gpsRef);
      };
    } catch (error) {
      console.error("[FirebaseGPS] Exception in listener setup:", error);
      setGpsData(prev => ({ ...prev, loading: false, error: `Setup error: ${error}` }));
    }
  }, []);

  console.log("[FirebaseGPS] Current GPS data state:", gpsData);
  return gpsData;
}
