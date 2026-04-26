"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  Mic,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Loader2,
  FileAudio,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Canine {
  _id: string;
  name: string;
  breedSize: string;
  age: number;
}

interface BarkRecord {
  _id: string;
  audioUrl: string;
  predictedEmotion: string;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Mini Audio Player Component                                        */
/* ------------------------------------------------------------------ */
function MiniAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-1">
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
        {playing ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function BarkAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: dogId } = use(params);

  const [canine, setCanine] = useState<Canine | null>(null);
  const [barks, setBarks] = useState<BarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [latestEmotion, setLatestEmotion] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dog physical traits for bark model
  const [dogWeight, setDogWeight] = useState("15");
  const [dogSex, setDogSex] = useState("male");
  const [dogBreed, setDogBreed] = useState("Labrador mix");

  // Fetch canine info & bark history
  useEffect(() => {
    async function fetchData() {
      try {
        const [canineRes, barkRes] = await Promise.all([
          fetch(`/api/canines/${dogId}`),
          fetch(`/api/barks?dogId=${dogId}`),
        ]);
        if (canineRes.ok) {
          const d = await canineRes.json();
          setCanine(d.canine || null);
        }
        if (barkRes.ok) {
          const d = await barkRes.json();
          setBarks(d.barks || []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dogId]);

  /* ---- Drag & Drop handlers ---- */
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".wav") || file.name.endsWith(".aif") || file.name.endsWith(".aiff") || file.name.endsWith(".mp3"))) {
      setSelectedFile(file);
    } else {
      toast.error("Please upload a .wav, .aif, or .mp3 file.");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  /* ---- Analyze bark ---- */
  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Please select an audio file first.");
      return;
    }

    setAnalyzing(true);
    setLatestEmotion(null);

    try {
      const formData = new FormData();
      formData.append("audio", selectedFile);
      formData.append("age", String(canine?.age ?? 3));
      formData.append("weight", dogWeight);
      formData.append("sex", dogSex);
      formData.append("breed", dogBreed);

      const flaskRes = await fetch("http://localhost:5000/predict-bark", {
        method: "POST",
        body: formData,
      });

      const prediction = await flaskRes.json();

      if (!flaskRes.ok || prediction.status === "error") {
        toast.error(prediction.message || "Bark prediction failed");
        setAnalyzing(false);
        return;
      }

      const emotion = prediction.emotion;
      setLatestEmotion(emotion);

      // Save to DB
      await fetch("/api/barks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dogId,
          audioUrl: selectedFile.name,
          predictedEmotion: emotion,
        }),
      });

      // Refresh list
      const barkRes = await fetch(`/api/barks?dogId=${dogId}`);
      if (barkRes.ok) {
        const d = await barkRes.json();
        setBarks(d.barks || []);
      }

      toast.success(`Bark emotion detected: ${emotion}`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Failed to connect to AI server. Is Flask running?");
    } finally {
      setAnalyzing(false);
    }
  }, [selectedFile, canine, dogWeight, dogSex, dogBreed, dogId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bark Analysis History
        </h1>
        <p className="text-muted-foreground">
          Upload bark audio files to predict your dog&apos;s emotional state
          using AI.
        </p>
      </div>

      {/* ---- Emotion Alert Banner ---- */}
      <AnimatePresence>
        {latestEmotion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert
              variant={
                latestEmotion.toLowerCase() === "aggression"
                  ? "destructive"
                  : "default"
              }
            >
              {latestEmotion.toLowerCase() === "aggression" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertTitle>Bark Emotion Detected</AlertTitle>
              <AlertDescription>
                {latestEmotion.toLowerCase() === "aggression"
                  ? `⚠️ Aggression detected in bark! Please monitor your dog carefully and check for stressors.`
                  : `Emotion: ${latestEmotion}. Your dog seems to be in a ${latestEmotion.toLowerCase()} state.`}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---- Upload Zone ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Upload Bark Audio
            </CardTitle>
            <CardDescription>
              Drag and drop or select a .wav / .aif file to analyze
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dropzone */}
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,.aif,.aiff,.mp3"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {selectedFile
                  ? selectedFile.name
                  : "Click or drag audio files here"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .wav, .aif, .mp3
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FileAudio className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            <Button
              className="w-full gap-2"
              onClick={handleAnalyze}
              disabled={!selectedFile || analyzing}
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              Analyze Bark
            </Button>
          </CardContent>
        </Card>

        {/* ---- Dog Details for Model ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dog Details</CardTitle>
            <CardDescription>
              Physical traits help the AI predict emotions more accurately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age (years)</Label>
                <Input
                  type="number"
                  value={canine?.age ?? 3}
                  disabled
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={dogWeight}
                  onChange={(e) => setDogWeight(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sex</Label>
                <Select value={dogSex} onValueChange={setDogSex}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Breed</Label>
                <Select value={dogBreed} onValueChange={setDogBreed}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Australian cattle dog">Australian Cattle Dog</SelectItem>
                    <SelectItem value="Australian shepherd">Australian Shepherd</SelectItem>
                    <SelectItem value="Dachsund">Dachshund</SelectItem>
                    <SelectItem value="German shorthair pointer">German Shorthair Pointer</SelectItem>
                    <SelectItem value="Labrador mix">Labrador Mix</SelectItem>
                    <SelectItem value="Springer spaniel">Springer Spaniel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Breed size from profile:{" "}
                <Badge variant="outline" className="ml-1 text-xs">
                  {canine?.breedSize ?? "Unknown"}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Bark History Table ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analysis History</CardTitle>
          <CardDescription>
            All past bark emotion analyses for this dog
          </CardDescription>
        </CardHeader>
        <CardContent>
          {barks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mic className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">
                No bark analyses yet. Upload an audio file to get started!
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Emotion</TableHead>
                    <TableHead>Audio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barks.map((bark, i) => (
                    <TableRow key={bark._id}>
                      <TableCell className="text-muted-foreground text-xs">
                        {i + 1}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(bark.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bark.predictedEmotion.toLowerCase() === "aggression"
                              ? "destructive"
                              : bark.predictedEmotion.toLowerCase() === "play"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {bark.predictedEmotion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bark.audioUrl ? (
                          <MiniAudioPlayer src={bark.audioUrl} />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
