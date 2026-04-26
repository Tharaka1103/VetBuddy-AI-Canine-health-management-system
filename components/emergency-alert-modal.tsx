"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Star,
  Hospital,
  Navigation,
  Siren,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { RouteMapCard } from "@/components/route-map-card";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Clinic {
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

interface EmergencyAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dogName: string;
  diagnosis: string;
  reason: string;
  userPosition: { lat: number; lng: number } | null;
}

/* ------------------------------------------------------------------ */
/*  Emergency Alert Modal                                              */
/* ------------------------------------------------------------------ */
export function EmergencyAlertModal({
  open,
  onOpenChange,
  dogName,
  diagnosis,
  reason,
  userPosition,
}: EmergencyAlertModalProps) {
  const [nearestClinic, setNearestClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNearestEmergencyClinic = useCallback(async () => {
    if (!userPosition) return;
    setLoading(true);
    try {
      // Look for 24/7 Specialized Hospitals first
      const params = new URLSearchParams({
        lat: userPosition.lat.toString(),
        lng: userPosition.lng.toString(),
        radius: "50",
        is24x7: "true",
      });

      const res = await fetch(`/api/clinics/nearby?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.clinics && data.clinics.length > 0) {
          // Prefer Specialized Hospital
          const specialized = data.clinics.find(
            (c: Clinic) => c.Facility_Type === "Specialized Hospital"
          );
          setNearestClinic(specialized || data.clinics[0]);
          return;
        }
      }

      // Fallback: any nearby clinic
      const fallbackParams = new URLSearchParams({
        lat: userPosition.lat.toString(),
        lng: userPosition.lng.toString(),
        radius: "50",
      });
      const fallbackRes = await fetch(
        `/api/clinics/nearby?${fallbackParams.toString()}`
      );
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData.clinics?.length > 0) {
          setNearestClinic(fallbackData.clinics[0]);
        }
      }
    } catch {
      console.error("Failed to fetch emergency clinic");
    } finally {
      setLoading(false);
    }
  }, [userPosition]);

  useEffect(() => {
    if (open) {
      fetchNearestEmergencyClinic();
    }
  }, [open, fetchNearestEmergencyClinic]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] border-destructive/50 sm:max-w-2xl flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Siren className="h-6 w-6" />
            </motion.div>
            Emergency Alert — {dogName}
          </DialogTitle>
          <DialogDescription className="text-destructive/80">
            Critical health anomaly detected. Immediate attention required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Alert Details */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">{diagnosis}</p>
                <p className="mt-1 text-sm text-muted-foreground">{reason}</p>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Nearest Clinic */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Hospital className="h-4 w-4 text-primary" />
              Best Emergency Clinic at Now
            </h3>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-[200px] rounded-xl" />
              </div>
            ) : nearestClinic ? (
              <div className="space-y-3">
                {/* Clinic info */}
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {nearestClinic.Center_Name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {nearestClinic.Location}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {nearestClinic.Is_24x7 && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 text-xs dark:text-emerald-400">
                          24/7
                        </Badge>
                      )}
                      {nearestClinic.distance_km !== undefined && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Navigation className="h-3 w-3" />
                          {nearestClinic.distance_km} km
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.round(nearestClinic.Average_Rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Clock className="h-3 w-3" />~
                      {nearestClinic.Current_Wait_Time_Mins} min
                    </Badge>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={`tel:${nearestClinic.Contact_Number}`}>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call Now
                      </Button>
                    </a>
                    <Link href={`/dashboard/clinics/${nearestClinic._id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        View Details
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Route Map */}
                {userPosition && (
                  <RouteMapCard
                    origin={userPosition}
                    destination={{
                      lat: nearestClinic.Location_Coords.coordinates[1],
                      lng: nearestClinic.Location_Coords.coordinates[0],
                    }}
                    destinationName={nearestClinic.Center_Name}
                    compact
                  />
                )}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No clinics found nearby. Please call a local emergency vet.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
