"use client";

import { useState, useEffect } from "react";

interface GeoPosition {
  lat: number;
  lng: number;
}

interface UseGeolocationResult {
  position: GeoPosition | null;
  error: string | null;
  loading: boolean;
}

/**
 * Hook to get the user's current geolocation.
 * Falls back to Colombo, Sri Lanka (6.9271, 79.8612) if geolocation is unavailable.
 */
export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      // Fallback to Colombo
      setPosition({ lat: 6.9271, lng: 79.8612 });
      setError("Geolocation not supported — using default location");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        // Fallback to Colombo
        setPosition({ lat: 6.9271, lng: 79.8612 });
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { position, error, loading };
}
