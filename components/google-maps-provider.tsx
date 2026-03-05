"use client";

import { useLoadScript } from "@react-google-maps/api";
import { createContext, useContext } from "react";

const libraries: ("places" | "geometry")[] = ["places"];

interface MapsContextValue {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const MapsContext = createContext<MapsContextValue>({
  isLoaded: false,
  loadError: undefined,
});

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  return (
    <MapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapsContext.Provider>
  );
}

export function useGoogleMaps() {
  return useContext(MapsContext);
}
