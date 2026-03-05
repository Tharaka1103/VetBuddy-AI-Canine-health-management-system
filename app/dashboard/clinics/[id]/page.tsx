"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  ArrowLeft,
  Hospital,
  Shield,
  Building2,
  Navigation,
  Stethoscope,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { useGsapFadeIn } from "@/hooks/use-gsap";
import { useLocation } from "@/components/location-provider";
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
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function ClinicDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const headerRef = useGsapFadeIn<HTMLDivElement>(0, 0.7);
  const { position } = useLocation();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClinic() {
      try {
        const res = await fetch(`/api/clinics/${id}`);
        if (res.ok) {
          const data = await res.json();
          setClinic(data.clinic);
        } else {
          toast.error("Clinic not found");
        }
      } catch {
        toast.error("Failed to load clinic details");
      } finally {
        setLoading(false);
      }
    }
    fetchClinic();
  }, [id]);

  /* ---- Star rating ---- */
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.round(rating)
            ? "fill-amber-400 text-amber-400"
            : "text-muted-foreground/30"
        }`}
      />
    ));

  /* ---- Facility badge color ---- */
  const facilityColor = (type: string) => {
    switch (type) {
      case "Specialized Hospital":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
      case "Government Vet Office":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    }
  };

  const facilityIcon = (type: string) => {
    switch (type) {
      case "Specialized Hospital":
        return <Hospital className="h-5 w-5 text-rose-500" />;
      case "Government Vet Office":
        return <Shield className="h-5 w-5 text-blue-500" />;
      default:
        return <Building2 className="h-5 w-5 text-emerald-500" />;
    }
  };

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Stethoscope className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">Clinic not found.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/dashboard/clinics")}
          >
            Back to Clinics
          </Button>
        </div>
      </div>
    );
  }

  const specializations = clinic.Specializations
    ? clinic.Specializations.split(",").map((s) => s.trim())
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* ---- Header ---- */}
      <div ref={headerRef} className="flex flex-wrap items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/clinics")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            {facilityIcon(clinic.Facility_Type)}
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {clinic.Center_Name}
            </h1>
          </div>
          <p className="mt-1 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            {clinic.Location}
          </p>
        </div>
        {clinic.Is_24x7 && (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="mr-1 h-3 w-3" />
            Open 24/7
          </Badge>
        )}
      </div>

      {/* ---- Route Map (prominent) ---- */}
      {position && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <RouteMapCard
            origin={position}
            destination={{
              lat: clinic.Location_Coords.coordinates[1],
              lng: clinic.Location_Coords.coordinates[0],
            }}
            destinationName={clinic.Center_Name}
            compact={false}
          />
        </motion.div>
      )}

      {/* ---- Details Cards ---- */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-primary" />
                Clinic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Facility Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Facility Type
                </span>
                <Badge className={facilityColor(clinic.Facility_Type)}>
                  {clinic.Facility_Type}
                </Badge>
              </div>
              <Separator />

              {/* Rating */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rating</span>
                <div className="flex items-center gap-1">
                  {renderStars(clinic.Average_Rating)}
                  <span className="ml-1.5 text-sm font-semibold">
                    {clinic.Average_Rating}
                  </span>
                </div>
              </div>
              <Separator />

              {/* Wait Time */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Wait Time
                </span>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />~
                  {clinic.Current_Wait_Time_Mins} min
                </Badge>
              </div>
              <Separator />

              {/* Availability */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Availability
                </span>
                <Badge
                  className={
                    clinic.Is_24x7
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }
                >
                  {clinic.Is_24x7 ? "24/7 Open" : "Regular Hours"}
                </Badge>
              </div>
              <Separator />

              {/* Contact */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contact</span>
                <a
                  href={`tel:${clinic.Contact_Number}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {clinic.Contact_Number}
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Specializations Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hospital className="h-5 w-5 text-rose-500" />
                Specializations
              </CardTitle>
              <CardDescription>Services offered at this clinic</CardDescription>
            </CardHeader>
            <CardContent>
              {specializations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec) => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className="gap-1 px-3 py-1.5"
                    >
                      <CheckCircle className="h-3 w-3 text-primary" />
                      {spec}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No specialization details available.
                </p>
              )}

              {/* Call to action buttons */}
              <div className="mt-6 space-y-3">
                <a
                  href={`tel:${clinic.Contact_Number}`}
                  className="block"
                >
                  <Button className="w-full gap-2" size="lg">
                    <Phone className="h-4 w-4" />
                    Call Now
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${clinic.Location_Coords.coordinates[1]},${clinic.Location_Coords.coordinates[0]}&travelmode=driving`;
                    window.open(url, "_blank");
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Maps
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
