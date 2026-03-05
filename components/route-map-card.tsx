"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import { useGoogleMaps } from "@/components/google-maps-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Navigation,
  Clock,
  Maximize2,
  Car,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface RouteMapCardProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  destinationName?: string;
  compact?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Map styles (dark-mode aware via CSS class check)                   */
/* ------------------------------------------------------------------ */
const mapContainerStyleCompact = {
  width: "100%",
  height: "200px",
  borderRadius: "0.75rem",
};

const mapContainerStyleFull = {
  width: "100%",
  height: "500px",
  borderRadius: "0.75rem",
};

const defaultMapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

/* ------------------------------------------------------------------ */
/*  RouteMap inner (renders the actual Google Map)                      */
/* ------------------------------------------------------------------ */
function RouteMapInner({
  origin,
  destination,
  onDirectionsResult,
  containerStyle,
}: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  onDirectionsResult: (result: google.maps.DirectionsResult | null) => void;
  containerStyle: React.CSSProperties;
}) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const requestedRef = useRef(false);

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      if (requestedRef.current) return;
      requestedRef.current = true;

      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(
            destination.lat,
            destination.lng
          ),
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            onDirectionsResult(result);
          } else {
            onDirectionsResult(null);
          }
        }
      );
    },
    [origin, destination, onDirectionsResult]
  );

  const center = {
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onMapLoad}
      options={defaultMapOptions}
    >
      {directions ? (
        <DirectionsRenderer
          directions={directions}
          options={{
            polylineOptions: {
              strokeColor: "#4f9a3a",
              strokeWeight: 5,
              strokeOpacity: 0.85,
            },
            suppressMarkers: false,
          }}
        />
      ) : (
        <>
          <Marker position={origin} label="A" />
          <Marker position={destination} label="B" />
        </>
      )}
    </GoogleMap>
  );
}

/* ------------------------------------------------------------------ */
/*  Main RouteMapCard Component                                        */
/* ------------------------------------------------------------------ */
export function RouteMapCard({
  origin,
  destination,
  destinationName = "Clinic",
  compact = true,
  className = "",
}: RouteMapCardProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const handleDirectionsResult = useCallback(
    (result: google.maps.DirectionsResult | null) => {
      if (!result) return;
      const leg = result.routes[0]?.legs[0];
      if (leg) {
        setRouteInfo({
          distance: leg.distance?.text || "—",
          duration: leg.duration?.text || "—",
        });
      }
    },
    []
  );

  // Open in Google Maps external
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  if (loadError) {
    return (
      <Card className={`border-destructive/30 ${className}`}>
        <CardContent className="flex items-center gap-2 py-4 text-sm text-destructive">
          <MapPin className="h-4 w-4" />
          Failed to load Google Maps
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={`overflow-hidden border-border/60 transition-all hover:shadow-md ${className}`}
      >
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Navigation className="h-4 w-4 text-primary" />
              Route to {destinationName}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={openInGoogleMaps}
                title="Open in Google Maps"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Full Screen"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-primary" />
                      Directions to {destinationName}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <RouteMapInner
                      origin={origin}
                      destination={destination}
                      onDirectionsResult={handleDirectionsResult}
                      containerStyle={mapContainerStyleFull}
                    />
                    {routeInfo && (
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="gap-1.5 px-3 py-1.5 text-sm"
                        >
                          <Car className="h-4 w-4" />
                          {routeInfo.distance}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="gap-1.5 px-3 py-1.5 text-sm"
                        >
                          <Clock className="h-4 w-4" />
                          {routeInfo.duration}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openInGoogleMaps}
                          className="ml-auto gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open in Google Maps
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {/* Compact map */}
          <RouteMapInner
            origin={origin}
            destination={destination}
            onDirectionsResult={handleDirectionsResult}
            containerStyle={
              compact ? mapContainerStyleCompact : mapContainerStyleFull
            }
          />

          {/* Route info pills */}
          {routeInfo && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <Car className="h-3 w-3" />
                {routeInfo.distance}
              </Badge>
              <Badge variant="outline" className="gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {routeInfo.duration}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
