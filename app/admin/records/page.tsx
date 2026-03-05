"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, Search, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface HealthRecord {
  _id: string;
  canineId: {
    _id: string;
    name: string;
  };
  temperature: number;
  heartRate: number;
  weight: number;
  symptoms: string;
  aiDiagnosis: string;
  aiConfidence: number;
  isAnomaly: boolean;
  userFeedback: string;
  createdAt: string;
}

export default function AdminRecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/health?all=true");
        if (res.ok) {
          const data = await res.json();
          setRecords(data.records || []);
        } else {
          toast.error("Failed to load records");
        }
      } catch {
        toast.error("Failed to load records");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = records.filter(
    (r) =>
      (r.canineId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.aiDiagnosis || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.symptoms || "").toLowerCase().includes(search.toLowerCase())
  );

  const anomalyCount = records.filter((r) => r.isAnomaly).length;

  if (loading) {
    return (
      <div className="mx-auto space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Health Records</h1>
        <p className="text-muted-foreground">
          Browse all health records across the system.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Records
            </CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{records.length}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anomalies Detected
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {anomalyCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by dog name, diagnosis, symptoms..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dog</TableHead>
                    <TableHead>Temp</TableHead>
                    <TableHead>HR</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Symptoms</TableHead>
                    <TableHead>AI Diagnosis</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Anomaly</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8 text-center">
                        <p className="text-muted-foreground">
                          No health records found.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell className="font-medium">
                          {r.canineId?.name || "Unknown"}
                        </TableCell>
                        <TableCell>{r.temperature}°F</TableCell>
                        <TableCell>{r.heartRate} bpm</TableCell>
                        <TableCell>{r.weight} lbs</TableCell>
                        <TableCell className="max-w-[150px] truncate text-muted-foreground">
                          {r.symptoms || "—"}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {r.aiDiagnosis || "—"}
                        </TableCell>
                        <TableCell>
                          {r.aiConfidence != null ? (
                            <Badge
                              variant={
                                r.aiConfidence > 0.7
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {(r.aiConfidence * 100).toFixed(0)}%
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {r.isAnomaly ? (
                            <Badge variant="destructive">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {r.userFeedback !== "none" ? (
                            <Badge
                              variant={
                                r.userFeedback === "accurate"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {r.userFeedback}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
