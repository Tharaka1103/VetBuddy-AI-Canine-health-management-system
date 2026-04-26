"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Brain,
  Dog,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface TrainingSession {
  _id: string;
  dogId: string;
  commandGiven: string;
  language: "en" | "si";
  headPosture: string;
  bodyPosture: string;
  atomicBehavior: string;
  isSuccessful: boolean;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const ROWS_PER_PAGE = 10;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) +
    " — " +
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );
}

function buildReaction(head: string, body: string, atomic: string): string {
  const parts: string[] = [];
  if (head) parts.push(`Head: ${head}`);
  if (body) parts.push(`Body: ${body}`);
  if (atomic) parts.push(`Action: ${atomic}`);
  return parts.length > 0 ? parts.join(" | ") : "—";
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function TrainingProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  /* ---- Fetch data ---- */
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/training?dogId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      } else {
        toast.error("Failed to load training sessions");
      }
    } catch {
      toast.error("Failed to load training sessions");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /* ---- Pagination ---- */
  const totalPages = Math.max(1, Math.ceil(sessions.length / ROWS_PER_PAGE));
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const pageRows = sessions.slice(startIdx, startIdx + ROWS_PER_PAGE);

  const getVisiblePages = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  /* ---- Quick stats ---- */
  const successCount = sessions.filter((s) => s.isSuccessful).length;
  const failCount = sessions.length - successCount;
  const successRate =
    sessions.length > 0
      ? Math.round((successCount / sessions.length) * 100)
      : 0;

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <Skeleton className="h-8 w-72" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* ================================================================ */}
      {/*  HEADER                                                          */}
      {/* ================================================================ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/dashboard/${id}/training`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Training Progress
            </h1>
            <p className="text-sm text-muted-foreground">
              Detailed history of every training session &amp; AI posture
              analysis
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* ================================================================ */}
        {/*  QUICK STATS                                                    */}
        {/* ================================================================ */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Sessions
                    </p>
                    <p className="text-2xl font-bold tabular-nums">
                      {sessions.length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {successRate}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                    <XCircle className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Failed Sessions
                    </p>
                    <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
                      {failCount}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/*  DATA TABLE                                                     */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Training History
              </CardTitle>
              <CardDescription>
                All training sessions sorted by most recent first
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                /* ---- Empty State ---- */
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                    <Dog className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-base font-semibold text-muted-foreground">
                    No training sessions found
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground/70">
                    Start a live training session with your dog to see progress
                    history here!
                  </p>
                  <Button className="mt-5" asChild>
                    <Link href={`/dashboard/${id}/training/live`}>
                      Start Training
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* ---- Table ---- */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-14">#</TableHead>
                        <TableHead>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Date &amp; Time
                          </span>
                        </TableHead>
                        <TableHead>Command</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Dog&apos;s Reaction (Postures)
                        </TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageRows.map((s, idx) => (
                        <TableRow
                          key={s._id}
                          className={s.isSuccessful ? "" : "bg-destructive/3"}
                        >
                          <TableCell className="tabular-nums text-muted-foreground">
                            {startIdx + idx + 1}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDateTime(s.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {s.commandGiven}
                            </Badge>
                            {s.language === "si" && (
                              <Badge
                                variant="secondary"
                                className="ml-1.5 text-[10px]"
                              >
                                සිංහල
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden max-w-xs truncate text-xs text-muted-foreground md:table-cell">
                            {buildReaction(
                              s.headPosture,
                              s.bodyPosture,
                              s.atomicBehavior
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {s.isSuccessful ? (
                              <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                                <CheckCircle className="h-3 w-3" />
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* ---- Pagination ---- */}
                  {sessions.length > ROWS_PER_PAGE && (
                    <div className="mt-6 flex flex-col items-center gap-2">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>

                          {getVisiblePages().map((page, i) =>
                            page === "ellipsis" ? (
                              <PaginationItem key={`ellipsis-${i}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            ) : (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={currentPage === page}
                                  onClick={() => setCurrentPage(page)}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          )}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage((p) =>
                                  Math.min(totalPages, p + 1)
                                )
                              }
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                      <p className="text-xs text-muted-foreground">
                        Showing {startIdx + 1}–
                        {Math.min(startIdx + ROWS_PER_PAGE, sessions.length)} of{" "}
                        {sessions.length} sessions
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ================================================================ */}
        {/*  BACK BUTTONS                                                   */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card>
            <CardContent className="flex flex-wrap gap-3 py-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/${id}/training`}>
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Training Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/${id}`}>
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Health Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
