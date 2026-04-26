"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  ArrowRight,
  Search,
  Hospital,
  Shield,
  Building2,
  Navigation,
  Loader2,
  Stethoscope,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGsapFadeIn } from "@/hooks/use-gsap";
import { useLocation } from "@/components/location-provider";
import { useFirebaseGPS } from "@/hooks/use-firebase-sensors";
import { RouteMapCard } from "@/components/route-map-card";
import { toast } from "sonner";

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
  travelTimeMins?: number;
  totalTimeMins?: number;
  isBest?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ------------------------------------------------------------------ */
/*  Facility Type Icon                                                 */
/* ------------------------------------------------------------------ */
function FacilityIcon({ type }: { type: string }) {
  switch (type) {
    case "Specialized Hospital":
      return <Hospital className="h-4 w-4 text-rose-500" />;
    case "Government Vet Office":
      return <Shield className="h-4 w-4 text-blue-500" />;
    default:
      return <Building2 className="h-4 w-4 text-emerald-500" />;
  }
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function ClinicsPage() {
  const headerRef = useGsapFadeIn<HTMLDivElement>(0, 0.7);
  const { position: devicePosition, loading: geoLoading, locationName: deviceLocationName } = useLocation();
  const firebaseGPS = useFirebaseGPS();

  // Use belt GPS if available and has fix, otherwise fall back to device location
  const position = firebaseGPS.beltOnline && firebaseGPS.gpsFix && firebaseGPS.lat && firebaseGPS.lng
    ? { lat: firebaseGPS.lat, lng: firebaseGPS.lng }
    : devicePosition;
  
  const locationName = firebaseGPS.beltOnline && firebaseGPS.gpsFix && firebaseGPS.lat && firebaseGPS.lng
    ? "Dog's Belt Location"
    : deviceLocationName;
  
  const isUsingBeltLocation = firebaseGPS.beltOnline && firebaseGPS.gpsFix && firebaseGPS.lat && firebaseGPS.lng;

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [only24x7, setOnly24x7] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  /* ---- Calculate travel time from distance (assuming 30 km/h average speed in city) ---- */
  const calculateTravelTime = (distanceKm: number): number => {
    // Average speed in city: 30 km/h = 0.5 km/min
    const avgSpeedKmPerMin = 0.5;
    return Math.round(distanceKm / avgSpeedKmPerMin);
  };

  /* ---- Fetch clinics (geo-sorted when position available) ---- */
  const fetchClinics = useCallback(async () => {
    setLoading(true);
    setUsingFallback(false);
    try {
      let results: Clinic[] = [];

      // Try nearby first if we have a position
      if (position) {
        const params = new URLSearchParams({
          lat: position.lat.toString(),
          lng: position.lng.toString(),
          radius: "50",
        });
        if (filterType !== "all") params.set("type", filterType);
        if (only24x7) params.set("is24x7", "true");

        const nearbyRes = await fetch(`/api/clinics/nearby?${params.toString()}`);
        if (nearbyRes.ok) {
          const nearbyData = await nearbyRes.json();
          results = nearbyData.clinics || [];
          
          // Calculate travel time and total time for each clinic
          results = results.map(clinic => {
            const distance = clinic.distance_km || 0;
            const travelTime = calculateTravelTime(distance);
            const totalTime = clinic.Current_Wait_Time_Mins + travelTime;
            return {
              ...clinic,
              travelTimeMins: travelTime,
              totalTimeMins: totalTime,
            };
          });

          // Find the best clinic (lowest total time)
          if (results.length > 0) {
            const bestClinic = results.reduce((best, current) => {
              // Consider total time as primary factor
              if (current.totalTimeMins! < best.totalTimeMins!) {
                return current;
              }
              // If total times are similar, consider rating
              if (Math.abs(current.totalTimeMins! - best.totalTimeMins!) <= 5) {
                if (current.Average_Rating > best.Average_Rating) {
                  return current;
                }
              }
              return best;
            });
            
            // Mark the best clinic
            results = results.map(clinic => ({
              ...clinic,
              isBest: clinic._id === bestClinic._id,
            }));
          }
        }
      }

      // If nearby returned nothing, fall back to all clinics
      if (results.length === 0) {
        const allRes = await fetch("/api/clinics");
        if (allRes.ok) {
          const allData = await allRes.json();
          results = allData.clinics || [];
          if (position) setUsingFallback(true);
        }
      }

      setClinics(results);
    } catch {
      toast.error("Failed to load clinics");
    } finally {
      setLoading(false);
    }
  }, [position, filterType, only24x7]);

  useEffect(() => {
    if (!geoLoading) fetchClinics();
  }, [geoLoading, fetchClinics]);

  /* ---- Client-side search filter ---- */
  const filteredClinics = clinics.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.Center_Name.toLowerCase().includes(q) ||
      c.Location.toLowerCase().includes(q) ||
      c.Specializations.toLowerCase().includes(q)
    );
  });

  /* ---- Star rating renderer ---- */
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i < Math.round(rating)
            ? "fill-amber-400 text-amber-400"
            : "text-muted-foreground/30"
        }`}
      />
    ));
  };

  /* ---- Loading state ---- */
  if (loading || geoLoading) {
    return (
      <div className="mx-auto space-y-6 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 p-6">
      {/* ---- Header ---- */}
      <div ref={headerRef}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">
            Care Center Finder
          </h1>
          <p className="text-muted-foreground">
            Find the nearest veterinary clinics &amp; hospitals for your
            companion
          </p>
        </motion.div>
      </div>

      {/* ---- Filters ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardContent className="flex flex-wrap items-end gap-4 p-4">
            {/* Search */}
            <div className="min-w-[200px] flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search clinics, locations, specializations..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Facility Type filter */}
            <div className="w-[200px] space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Facility Type
              </Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Specialized Hospital">
                    Specialized Hospital
                  </SelectItem>
                  <SelectItem value="General Vet Clinic">
                    General Vet Clinic
                  </SelectItem>
                  <SelectItem value="Government Vet Office">
                    Government Vet Office
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 24/7 toggle */}
            <div className="flex items-center gap-2 pb-0.5">
              <Switch checked={only24x7} onCheckedChange={setOnly24x7} />
              <Label className="text-sm">24/7 Only</Label>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ---- Results Count ---- */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredClinics.length} clinic
            {filteredClinics.length !== 1 ? "s" : ""} found
            {position && !usingFallback && " near your location"}
          </p>
          {position && (
            <Badge variant={isUsingBeltLocation ? "default" : "outline"} className={`gap-1 text-xs ${isUsingBeltLocation ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : ""}`}>
              <Navigation className="h-3 w-3" />
              {locationName || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`}
              {isUsingBeltLocation && <span className="ml-1">(Belt GPS)</span>}
            </Badge>
          )}
        </div>
        {isUsingBeltLocation && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            Using dog's belt GPS location for care center search
          </div>
        )}
        {usingFallback && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            No clinics found within 50 km of your detected location. Showing all
            available clinics instead. You can update your location from the
            sidebar.
          </div>
        )}
      </div>

      {/* ---- Clinics Grid ---- */}
      {filteredClinics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Stethoscope className="mb-4 h-16 w-16 text-muted-foreground/40" />
          <h2 className="text-xl font-semibold">No clinics found</h2>
          <p className="mt-1 text-muted-foreground">
            Try adjusting your filters or search query.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredClinics.map((clinic) => (
            <motion.div key={clinic._id} variants={cardVariant}>
              <Card className="group flex h-full flex-col border-border/60 transition-all hover:border-primary/40 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="flex items-center gap-2 text-base leading-tight">
                        <FacilityIcon type={clinic.Facility_Type} />
                        <span className="truncate">{clinic.Center_Name}</span>
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {clinic.Location}
                      </CardDescription>
                    </div>
                    {clinic.Is_24x7 && (
                      <Badge className="shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        24/7
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col space-y-3">
                  {/* Best Clinic Badge */}
                  {clinic.isBest && (
                    <Badge className="w-fit gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                      <Award className="h-3 w-3" />
                      Best Choice
                    </Badge>
                  )}

                  {/* Rating & Wait Time */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      {renderStars(clinic.Average_Rating)}
                      <span className="ml-1 text-xs font-medium">
                        {clinic.Average_Rating}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      ~{clinic.Current_Wait_Time_Mins} min wait
                    </div>
                  </div>

                  {/* Travel Time & Total Time */}
                  {clinic.travelTimeMins !== undefined && clinic.totalTimeMins !== undefined && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="outline" className="gap-1">
                        <Navigation className="h-3 w-3" />
                        {clinic.distance_km} km
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        ~{clinic.travelTimeMins} min travel
                      </Badge>
                      <Badge variant={clinic.isBest ? "default" : "outline"} className={`gap-1 ${clinic.isBest ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" : ""}`}>
                        <Clock className="h-3 w-3" />
                        Total: ~{clinic.totalTimeMins} min
                      </Badge>
                    </div>
                  )}

                  {/* Facility Type Badge */}
                  <Badge variant="secondary" className="w-fit text-xs">
                    {clinic.Facility_Type}
                  </Badge>

                  {/* Specializations */}
                  {clinic.Specializations && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {clinic.Specializations}
                    </p>
                  )}

                  {/* Distance badge (fallback if no travel time calculated) */}
                  {clinic.distance_km !== undefined && clinic.travelTimeMins === undefined && (
                    <Badge variant="outline" className="w-fit gap-1 text-xs">
                      <Navigation className="h-3 w-3" />
                      {clinic.distance_km} km away
                    </Badge>
                  )}

                  {/* Inline Route Map (toggled) */}
                  <AnimatePresence>
                    {selectedClinicId === clinic._id && position && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RouteMapCard
                          origin={position}
                          destination={{
                            lat: clinic.Location_Coords.coordinates[1],
                            lng: clinic.Location_Coords.coordinates[0],
                          }}
                          destinationName={clinic.Center_Name}
                          compact
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() =>
                        setSelectedClinicId(
                          selectedClinicId === clinic._id
                            ? null
                            : clinic._id
                        )
                      }
                    >
                      <Navigation className="h-3 w-3" />
                      {selectedClinicId === clinic._id
                        ? "Hide Route"
                        : "View Route"}
                    </Button>
                    <Link href={`/dashboard/clinics/${clinic._id}`}>
                      <Button size="sm" className="gap-1">
                        Details
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                    {clinic.Contact_Number && (
                      <a href={`tel:${clinic.Contact_Number}`} className="ml-auto">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
