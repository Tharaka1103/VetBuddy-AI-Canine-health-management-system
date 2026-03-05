"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dog, Plus, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useGsapStagger } from "@/hooks/use-gsap";
import { toast } from "sonner";

interface Canine {
  _id: string;
  name: string;
  breedSize: string;
  age: number;
  image: string;
  createdAt: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [canines, setCanines] = useState<Canine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [dogName, setDogName] = useState("");
  const [breedSize, setBreedSize] = useState("");
  const [dogAge, setDogAge] = useState("");

  const staggerRef = useGsapStagger<HTMLDivElement>(":scope > a", 0.08);

  const fetchCanines = useCallback(async () => {
    try {
      const res = await fetch("/api/canines");
      if (res.ok) {
        const data = await res.json();
        setCanines(data.canines);
      }
    } catch {
      toast.error("Failed to load dogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) fetchCanines();
  }, [authLoading, user, fetchCanines]);

  const handleRegisterDog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/canines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dogName,
          breedSize,
          age: Number(dogAge),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register dog");
      }
      toast.success(`${dogName} has been registered!`);
      setDialogOpen(false);
      setDogName("");
      setBreedSize("");
      setDogAge("");
      fetchCanines();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to register dog");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto p-6">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dogs</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || user?.email}! Manage and monitor your
            pups below.
          </p>
        </div>

        {/* Register New Dog Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Register Dog
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register a New Dog</DialogTitle>
              <DialogDescription>
                Fill out the details below to add a new companion.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegisterDog} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dogName">Dog Name</Label>
                <Input
                  id="dogName"
                  placeholder="e.g. Max"
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breedSize">Breed Size</Label>
                <Select value={breedSize} onValueChange={setBreedSize} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select breed size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Small">Small</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dogAge">Age (years)</Label>
                <Input
                  id="dogAge"
                  type="number"
                  min="0"
                  max="30"
                  placeholder="e.g. 3"
                  value={dogAge}
                  onChange={(e) => setDogAge(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting || !breedSize}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Register
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Dogs Grid */}
      {canines.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Dog className="mb-4 h-16 w-16 text-muted-foreground/40" />
          <h2 className="text-xl font-semibold">No dogs registered yet</h2>
          <p className="mt-1 text-muted-foreground">
            Click &quot;Register Dog&quot; to add your first companion.
          </p>
        </motion.div>
      ) : (
        <motion.div
          ref={staggerRef}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {canines.map((dog) => (
            <Link key={dog._id} href={`/dashboard/${dog._id}`}>
              <motion.div variants={cardVariant}>
                <Card className="group cursor-pointer border-border/60 transition-all hover:border-primary/40 hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Dog className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{dog.breedSize}</Badge>
                    </div>
                    <CardTitle className="mt-3 text-xl">{dog.name}</CardTitle>
                    <CardDescription>
                      {dog.age} year{dog.age !== 1 ? "s" : ""} old &middot;{" "}
                      {dog.breedSize} breed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>View Health Dashboard</span>
                      <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}
