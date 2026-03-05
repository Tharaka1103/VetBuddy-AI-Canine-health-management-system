"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface GeoPosition {
  lat: number;
  lng: number;
}

interface LocationContextValue {
  position: GeoPosition | null;
  locationName: string;
  loading: boolean;
  error: string | null;
  /** Accuracy in metres (lower = better). null when unknown. */
  accuracy: number | null;
  /** Re-request the browser's current GPS position */
  refreshLocation: () => void;
  /** Manually override the location (stored in localStorage) */
  setManualLocation: (pos: GeoPosition, name?: string) => void;
  /** Whether location was manually set vs auto-detected */
  isManual: boolean;
}

const LocationContext = createContext<LocationContextValue>({
  position: null,
  locationName: "Detecting…",
  loading: true,
  error: null,
  accuracy: null,
  refreshLocation: () => {},
  setManualLocation: () => {},
  isManual: false,
});

const STORAGE_KEY = "woofy-user-location";

/* ------------------------------------------------------------------ */
/*  Reverse geocode via Google → fallback to coord string              */
/* ------------------------------------------------------------------ */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (key) {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&result_type=locality|administrative_area_level_1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results?.[0]?.formatted_address) {
          const parts = data.results[0].formatted_address.split(", ");
          return parts.length >= 2
            ? parts.slice(0, 2).join(", ")
            : data.results[0].formatted_address;
        }
      }
    }
  } catch {
    // fall through
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/* ------------------------------------------------------------------ */
/*  IP-based geolocation fallback (free APIs, no key needed)           */
/* ------------------------------------------------------------------ */
async function ipGeolocate(): Promise<{
  lat: number;
  lng: number;
  city: string;
} | null> {
  // Try multiple free IP geolocation APIs in order
  const apis = [
    {
      url: "https://ipapi.co/json/",
      parse: (d: Record<string, unknown>) => ({
        lat: d.latitude as number,
        lng: d.longitude as number,
        city: `${d.city}, ${d.country_name}`,
      }),
    },
    {
      url: "https://ipwho.is/",
      parse: (d: Record<string, unknown>) => ({
        lat: d.latitude as number,
        lng: d.longitude as number,
        city: `${d.city}, ${d.country}`,
      }),
    },
    {
      url: "https://ip-api.com/json/?fields=lat,lon,city,country",
      parse: (d: Record<string, unknown>) => ({
        lat: d.lat as number,
        lng: d.lon as number,
        city: `${d.city}, ${d.country}`,
      }),
    },
  ];

  for (const api of apis) {
    try {
      const res = await fetch(api.url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        const parsed = api.parse(data);
        if (parsed.lat && parsed.lng && !isNaN(parsed.lat)) return parsed;
      }
    } catch {
      continue;
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Provider Component                                                 */
/* ------------------------------------------------------------------ */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [locationName, setLocationName] = useState("Detecting…");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isManual, setIsManual] = useState(false);

  // Track the best accuracy seen so far so we only update on improvements
  const bestAccuracyRef = useRef<number>(Infinity);
  const watchIdRef = useRef<number | null>(null);
  const geocodeAbortRef = useRef(false);

  /* ---- Resolve position → name (debounced to avoid spam) ---- */
  const resolveLocationName = useCallback(async (pos: GeoPosition) => {
    geocodeAbortRef.current = false;
    const name = await reverseGeocode(pos.lat, pos.lng);
    if (!geocodeAbortRef.current) {
      setLocationName(name);
    }
  }, []);

  /* ---- Stop any active watcher ---- */
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  /* ---- IP fallback ---- */
  const tryIpFallback = useCallback(async () => {
    const result = await ipGeolocate();
    if (result) {
      const pos = { lat: result.lat, lng: result.lng };
      setPosition(pos);
      setAccuracy(null); // IP accuracy is ~5-50 km, mark as unknown
      setLocationName(result.city || `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`);
      setLoading(false);
      setError("Using approximate IP-based location");
    } else {
      setLocationName("Location unavailable");
      setLoading(false);
      setError("Could not detect location");
    }
  }, []);

  /* ---- Request browser geolocation (watch-based, two-phase) ---- */
  const requestBrowserLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    setLocationName("Detecting…");
    setAccuracy(null);
    bestAccuracyRef.current = Infinity;
    geocodeAbortRef.current = true; // cancel any pending geocode
    stopWatching();

    if (!navigator.geolocation) {
      tryIpFallback();
      return;
    }

    let resolved = false;
    let highAccuracyStarted = false;

    const handleSuccess = (geoPos: GeolocationPosition) => {
      const acc = geoPos.coords.accuracy; // in metres

      // Only update if this reading is more accurate than our best so far
      if (acc < bestAccuracyRef.current) {
        bestAccuracyRef.current = acc;
        const pos: GeoPosition = {
          lat: geoPos.coords.latitude,
          lng: geoPos.coords.longitude,
        };
        setPosition(pos);
        setAccuracy(Math.round(acc));
        setIsManual(false);
        setError(null);

        if (!resolved) {
          resolved = true;
          setLoading(false);
          localStorage.removeItem(STORAGE_KEY);
        }

        resolveLocationName(pos);
      }

      // Once we get a good reading (< 100m), stop watching to save battery
      if (acc < 100) {
        stopWatching();
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn("Geolocation error:", err.message, `(code ${err.code})`);

      // If high-accuracy failed, try low-accuracy
      if (!highAccuracyStarted) {
        highAccuracyStarted = true;
        tryLowAccuracy();
        return;
      }

      // If we already have a position from an earlier reading, keep it
      if (resolved) return;

      // Both attempts failed → fall back to IP geolocation
      setError(err.message);
      tryIpFallback();
    };

    // Phase 1: Try high accuracy first (GPS on mobile, WiFi on desktop)
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Force fresh reading, no cache
      }
    );

    // Phase 2 fallback: low accuracy (faster, uses WiFi/cell/IP)
    const tryLowAccuracy = () => {
      stopWatching();
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        (err) => {
          console.warn("Low-accuracy geolocation also failed:", err.message);
          if (!resolved) {
            setError(err.message);
            tryIpFallback();
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    };

    // Safety: stop watching after 30 seconds to save battery
    const safetyTimeout = setTimeout(() => {
      stopWatching();
      if (!resolved) {
        tryIpFallback();
      }
    }, 30000);

    return () => {
      clearTimeout(safetyTimeout);
      stopWatching();
    };
  }, [resolveLocationName, stopWatching, tryIpFallback]);

  /* ---- Manual location setter ---- */
  const setManualLocation = useCallback(
    (pos: GeoPosition, name?: string) => {
      stopWatching();
      setPosition(pos);
      setIsManual(true);
      setLoading(false);
      setError(null);
      setAccuracy(null);
      bestAccuracyRef.current = Infinity;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...pos, name: name || "" })
      );
      if (name) {
        setLocationName(name);
      } else {
        resolveLocationName(pos);
      }
    },
    [resolveLocationName, stopWatching]
  );

  /* ---- On mount: check localStorage → else browser geolocation ---- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lat && parsed.lng) {
          setPosition({ lat: parsed.lat, lng: parsed.lng });
          setIsManual(true);
          setLoading(false);
          if (parsed.name) {
            setLocationName(parsed.name);
          } else {
            resolveLocationName({ lat: parsed.lat, lng: parsed.lng });
          }
          return;
        }
      }
    } catch {
      // ignore
    }
    requestBrowserLocation();

    // Cleanup watcher on unmount
    return () => {
      stopWatching();
    };
  }, [requestBrowserLocation, resolveLocationName, stopWatching]);

  return (
    <LocationContext.Provider
      value={{
        position,
        locationName,
        loading,
        error,
        accuracy,
        refreshLocation: requestBrowserLocation,
        setManualLocation,
        isManual,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
