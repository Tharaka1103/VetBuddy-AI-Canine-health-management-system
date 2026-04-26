"use client";

/* ------------------------------------------------------------------ */
/*  Client-side WebM → WAV converter (no ffmpeg needed)                */
/* ------------------------------------------------------------------ */
async function blobToWav(blob: Blob): Promise<Blob> {
  const audioCtx = new AudioContext();
  const arrayBuf = await blob.arrayBuffer();
  const decoded = await audioCtx.decodeAudioData(arrayBuf);
  const numCh = decoded.numberOfChannels;
  const rate = decoded.sampleRate;
  const length = decoded.length;
  const dataSize = length * numCh * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buffer);

  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  v.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, numCh, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * numCh * 2, true);
  v.setUint16(32, numCh * 2, true);
  v.setUint16(34, 16, true);
  writeStr(36, "data");
  v.setUint32(40, dataSize, true);

  let off = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, decoded.getChannelData(ch)[i]));
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }
  await audioCtx.close();
  return new Blob([buffer], { type: "audio/wav" });
}

import { useState, useEffect, useRef, use, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Send,
  Radio,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Volume2,
  Activity,
  Wifi,
  WifiOff,
  RotateCcw,
  Cpu,
  Loader2,
  type LucideIcon,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFirebaseSensors } from "@/hooks/use-firebase-sensors";

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */
type Phase =
  | "idle"
  | "recording"
  | "editing"
  | "broadcasting"
  | "monitoring"
  | "analyzing"
  | "result";

interface SensorReadings {
  neck_x: number;
  neck_y: number;
  neck_z: number;
  back_x: number;
  back_y: number;
  back_z: number;
}

interface PredictionResult {
  head_posture: string;
  body_posture: string;
  atomic_behavior: string;
}

const MONITORING_DURATION = 10; // seconds

/** Map voice commands → expected body_posture / atomic_behavior values */
const postureMap: Record<string, string[]> = {
  sit: ["Sitting"],
  down: ["Lying Down", "Lying"],
  stand: ["Standing"],
  stay: ["Standing", "Sitting"],
  come: ["Walking", "Running", "Trotting"],
  heel: ["Walking", "Trotting"],
  run: ["Running", "Galloping"],
  walk: ["Walking", "Trotting"],
  fetch: ["Running", "Galloping"],
  roll: ["Lying Down", "Rolling", "Lying"],
  shake: ["Sitting", "Standing"],
  speak: ["Sitting", "Standing", "Barking"],
  stop: ["Standing", "Sitting"],
  jump: ["Jumping", "Leaping"],
  spin: ["Standing", "Spinning"],
  // Sinhala commands
  "වාඩි වෙන්න": ["Sitting"],
  "නැගිටින්න": ["Standing"],
  "බිම වැතිරෙන්න": ["Lying Down", "Lying"],
  "ඉන්න": ["Sitting", "Standing"],
  "එන්න": ["Walking", "Running"],
};

/** Generate simulated accelerometer readings that match a voice command */
function generateSimulatedReadings(command: string): SensorReadings {
  const cmd = command.toLowerCase().trim();
  const r = (base: number, variance: number) =>
    Math.round((base + (Math.random() - 0.5) * variance) * 100) / 100;

  if (cmd.includes("sit") || cmd.includes("වාඩි"))
    return { neck_x: r(-0.3, 0.2), neck_y: r(0.8, 0.3), neck_z: r(0.5, 0.2), back_x: r(0.1, 0.1), back_y: r(-0.5, 0.2), back_z: r(0.9, 0.1) };
  if (cmd.includes("down") || cmd.includes("lie") || cmd.includes("වැතිරෙන්න"))
    return { neck_x: r(0.1, 0.1), neck_y: r(0.2, 0.2), neck_z: r(0.9, 0.1), back_x: r(0.0, 0.1), back_y: r(0.1, 0.1), back_z: r(1.0, 0.1) };
  if (cmd.includes("run") || cmd.includes("fetch"))
    return { neck_x: r(1.5, 0.8), neck_y: r(0.5, 0.5), neck_z: r(0.3, 0.3), back_x: r(2.0, 1.0), back_y: r(0.8, 0.6), back_z: r(0.4, 0.3) };
  if (cmd.includes("walk") || cmd.includes("come") || cmd.includes("heel") || cmd.includes("එන්න"))
    return { neck_x: r(0.6, 0.3), neck_y: r(0.4, 0.3), neck_z: r(0.5, 0.2), back_x: r(0.8, 0.4), back_y: r(0.3, 0.2), back_z: r(0.6, 0.2) };
  if (cmd.includes("stand") || cmd.includes("stay") || cmd.includes("stop") || cmd.includes("නැගිටින්න") || cmd.includes("ඉන්න"))
    return { neck_x: r(0.0, 0.1), neck_y: r(0.9, 0.1), neck_z: r(0.3, 0.1), back_x: r(0.0, 0.1), back_y: r(0.9, 0.1), back_z: r(0.2, 0.1) };
  if (cmd.includes("jump") || cmd.includes("leap"))
    return { neck_x: r(0.5, 0.4), neck_y: r(2.0, 0.8), neck_z: r(-0.5, 0.4), back_x: r(0.6, 0.5), back_y: r(2.5, 1.0), back_z: r(-0.8, 0.5) };
  if (cmd.includes("roll") || cmd.includes("spin"))
    return { neck_x: r(1.2, 0.6), neck_y: r(0.3, 0.5), neck_z: r(0.8, 0.6), back_x: r(1.5, 0.8), back_y: r(0.2, 0.4), back_z: r(0.7, 0.5) };

  // Default: mild standing-like readings
  return { neck_x: r(0.1, 0.2), neck_y: r(0.8, 0.2), neck_z: r(0.4, 0.2), back_x: r(0.1, 0.2), back_y: r(0.7, 0.2), back_z: r(0.5, 0.2) };
}

/** Check if the AI-predicted posture matches the issued voice command */
function checkCommandMatch(
  command: string,
  prediction: PredictionResult
): boolean {
  const cmd = command.toLowerCase().trim();

  // Try exact key match first (covers Sinhala)
  let expected = postureMap[cmd];

  // Fall back to partial-word match
  if (!expected) {
    const matchWord = Object.keys(postureMap).find((key) => cmd.includes(key));
    if (matchWord) expected = postureMap[matchWord];
  }

  if (!expected) return false;

  return expected.some(
    (p) =>
      prediction.body_posture.toLowerCase().includes(p.toLowerCase()) ||
      prediction.atomic_behavior.toLowerCase().includes(p.toLowerCase())
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card Sub-component                                            */
/* ------------------------------------------------------------------ */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */
export default function LiveTrainingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // ---- State ----
  const [isSimulation, setIsSimulation] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState<"en" | "si">("en");
  const [countdown, setCountdown] = useState(MONITORING_DURATION);
  const [progress, setProgress] = useState(0);
  const [sensorReadings, setSensorReadings] = useState<SensorReadings | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  // Voice recording (MediaRecorder → Flask transcription)
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Belt simulator hook (always called — React rules of hooks)
  const belt = useFirebaseSensors(60);

  // Ref to capture latest belt data at monitoring end
  const beltDataRef = useRef(belt.currentData);
  useEffect(() => {
    beltDataRef.current = belt.currentData;
  }, [belt.currentData]);

  // Ref for captureAndAnalyze to avoid stale closures in the timer
  const captureRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // Revoke old audio object URL on change
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Cleanup media tracks on unmount
  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ---- Phase reset helper ----
  const resetSession = useCallback(() => {
    setPhase("idle");
    setTranscript("");
    setCountdown(MONITORING_DURATION);
    setProgress(0);
    setSensorReadings(null);
    setPrediction(null);
    setIsSuccess(null);
  }, []);

  /** Send recorded audio to Flask for server-side transcription */
  const transcribeAudio = useCallback(
    async (blob: Blob) => {
      setTranscribing(true);
      try {
        const wavBlob = await blobToWav(blob);
        const fd = new FormData();
        fd.append("audio", wavBlob, "recording.wav");
        fd.append("language", language === "en" ? "en-US" : "si-LK");

        const res = await fetch("http://localhost:5000/transcribe", {
          method: "POST",
          body: fd,
        });
        const json = await res.json();

        if (json.status === "success" && json.text) {
          setTranscript(json.text);
          setPhase("editing");
          toast.success("Voice command captured!");
        } else {
          toast.error(json.message || "Could not understand the audio.");
          setPhase("idle");
        }
      } catch {
        toast.error("Failed to transcribe. Is the Flask server running?");
        setPhase("idle");
      } finally {
        setTranscribing(false);
      }
    },
    [language]
  );

  // ---- 1. Start / Stop voice recording (MediaRecorder → Flask) ----
  const toggleListening = useCallback(async () => {
    if (listening) {
      // Stop recorder → triggers onstop → saves blob → transcribes
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setListening(false);
      return;
    }

    // Start MediaRecorder
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error("Microphone access denied. Please allow mic permissions.");
      return;
    }
    mediaStreamRef.current = stream;
    audioChunksRef.current = [];

    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      if (blob.size === 0) return;
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(blob));
      setPhase("recording"); // keep recording phase visually until transcription completes
      transcribeAudio(blob);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setListening(true);
    setPhase("recording");
  }, [listening, audioUrl, transcribeAudio]);

  // ---- 2. Confirm & Send ----
  const handleConfirmAndSend = useCallback(() => {
    if (!transcript.trim()) {
      toast.error("Please enter a command first.");
      return;
    }
    setPhase("broadcasting");

    // Show broadcasting for 2 seconds, then begin monitoring
    setTimeout(() => {
      setPhase("monitoring");
    }, 2000);
  }, [transcript]);

  // ---- 4. Capture readings → AI prediction → evaluate ----
  const captureAndAnalyze = useCallback(async () => {
    setPhase("analyzing");

    let readings: SensorReadings;

    if (isSimulation) {
      readings = generateSimulatedReadings(transcript);
    } else {
      const data = beltDataRef.current;
      if (data) {
        const acc = data.accelerometer;
        readings = {
          neck_x: acc.x,
          neck_y: acc.y,
          neck_z: acc.z,
          back_x: Math.round((acc.x * 0.85 + (Math.random() - 0.5) * 0.3) * 100) / 100,
          back_y: Math.round((acc.y * 0.9 + (Math.random() - 0.5) * 0.2) * 100) / 100,
          back_z: Math.round((acc.z * 0.95 + (Math.random() - 0.5) * 0.15) * 100) / 100,
        };
      } else {
        toast.error("No belt data available. Connect the belt or enable Simulation Mode.");
        setPhase("idle");
        return;
      }
    }

    setSensorReadings(readings);

    try {
      const res = await fetch("http://localhost:5000/predict-behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(readings),
      });

      if (!res.ok) throw new Error("AI prediction failed");
      const data = await res.json();

      if (data.status === "error") throw new Error(data.message);

      const pred: PredictionResult = {
        head_posture: data.head_posture,
        body_posture: data.body_posture,
        atomic_behavior: data.atomic_behavior,
      };
      setPrediction(pred);

      const matched = checkCommandMatch(transcript, pred);
      setIsSuccess(matched);
      setPhase("result");

      // Save training session to DB
      setSaving(true);
      try {
        await fetch("/api/training", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dogId: id,
            commandGiven: transcript.trim(),
            language,
            headPosture: pred.head_posture,
            bodyPosture: pred.body_posture,
            atomicBehavior: pred.atomic_behavior,
            isSuccessful: matched,
          }),
        });
      } catch {
        console.warn("Failed to save training session");
      } finally {
        setSaving(false);
      }
    } catch (err) {
      console.error("Prediction error:", err);
      toast.error("Failed to get AI prediction. Is the Flask server running?");
      setPhase("idle");
    }
  }, [isSimulation, transcript, id, language]);

  // Keep ref in sync
  useEffect(() => {
    captureRef.current = captureAndAnalyze;
  }, [captureAndAnalyze]);

  // ---- 3. Monitoring Phase (10-second countdown) ----
  useEffect(() => {
    if (phase !== "monitoring") return;

    setCountdown(MONITORING_DURATION);
    setProgress(0);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        setProgress(((MONITORING_DURATION - next) / MONITORING_DURATION) * 100);
        if (next <= 0) {
          clearInterval(interval);
          captureRef.current?.();
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <div className="mx-auto space-y-6 p-4 pb-20 md:p-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Live Training Session
          </h1>
          <p className="text-sm text-muted-foreground">
            Issue voice commands and evaluate your dog&apos;s response in real time
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/${id}/training/progress`}>
            Training History
            <ArrowRight className="mr-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* ================================================================ */}
      {/*  SIMULATION MODE TOGGLE                                          */}
      {/* ================================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isSimulation
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isSimulation ? (
                  <Cpu className="h-5 w-5" />
                ) : (
                  <Wifi className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {isSimulation ? "Simulation Mode" : "Live Hardware Mode"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isSimulation
                    ? "Using AI-generated sensor data matching voice commands"
                    : "Reading real-time data from the IoT canine belt"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="sim-toggle" className="text-xs text-muted-foreground">
                Simulation
              </Label>
              <Switch
                id="sim-toggle"
                checked={isSimulation}
                onCheckedChange={(checked) => {
                  setIsSimulation(checked);
                  if (!checked && !belt.connected) {
                    belt.toggleConnection();
                  }
                }}
                disabled={phase !== "idle" && phase !== "result"}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Belt Status (when hardware mode) */}
      <AnimatePresence>
        {!isSimulation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={belt.connected ? "border-emerald-500/40" : "border-red-500/40"}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  {belt.connected ? (
                    <Wifi className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    Belt: {belt.connected ? "Connected" : "Disconnected"}
                  </span>
                  {belt.connected && (
                    <Badge variant="secondary" className="text-xs">
                      🔋 {belt.beltStatus.batteryLevel}%
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={belt.toggleConnection}
                >
                  {belt.connected ? "Disconnect" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  STEP 1 — VOICE INPUT                                           */}
      {/* ================================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              Voice Command
            </CardTitle>
            <CardDescription>
              Select language, record a voice command, or type it manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Selection */}
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as "en" | "si")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="si">සිංහල (Sinhala)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Microphone Button */}
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant={listening ? "destructive" : "default"}
                className={`w-full sm:w-auto ${listening ? "animate-pulse" : ""}`}
                onClick={toggleListening}
                disabled={
                  transcribing ||
                  phase === "broadcasting" ||
                  phase === "monitoring" ||
                  phase === "analyzing"
                }
              >
                {listening ? (
                  <>
                    <MicOff className="mr-2 h-5 w-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    🎤 Start Recording
                  </>
                )}
              </Button>

              {listening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Recording… Click to stop &amp; transcribe
                  </span>
                </motion.div>
              )}

              {transcribing && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Transcribing your voice…
                  </span>
                </div>
              )}
            </div>

            {/* Recorded Audio Preview */}
            {audioUrl && !listening && (
              <div className="rounded-lg border border-border/60 p-3 space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Recorded Audio
                </Label>
                <audio controls src={audioUrl} className="w-full h-8" />
              </div>
            )}

            {/* Transcript Input */}
            <div className="space-y-2">
              <Label htmlFor="command-input" className="text-xs text-muted-foreground">
                Transcribed / Typed Command
              </Label>
              <Input
                id="command-input"
                placeholder={
                  language === "en"
                    ? 'e.g. sit, stand, come, run, down...'
                    : 'e.g. වාඩි වෙන්න, නැගිටින්න, එන්න...'
                }
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  if (phase === "idle") setPhase("editing");
                }}
                disabled={
                  phase === "broadcasting" ||
                  phase === "monitoring" ||
                  phase === "analyzing"
                }
              />
            </div>

            {/* Quick Commands */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Quick Commands
              </Label>
              <div className="flex flex-wrap gap-2">
                {(language === "en"
                  ? ["Sit", "Stand", "Down", "Stay", "Come", "Heel", "Run", "Fetch"]
                  : ["වාඩි වෙන්න", "නැගිටින්න", "බිම වැතිරෙන්න", "ඉන්න", "එන්න"]
                ).map((cmd) => (
                  <Button
                    key={cmd}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setTranscript(cmd);
                      setPhase("editing");
                    }}
                  >
                    {cmd}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ================================================================ */}
      {/*  STEP 2 — CONFIRM & SEND                                        */}
      {/* ================================================================ */}
      <AnimatePresence>
        {(phase === "editing" || (transcript && phase === "idle")) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    2
                  </span>
                  Confirm &amp; Send
                </CardTitle>
                <CardDescription>
                  Review your command, then broadcast it to the canine belt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {transcript && (
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Command to send:
                    </p>
                    <p className="mt-1 text-lg font-semibold capitalize">
                      &quot;{transcript}&quot;
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleConfirmAndSend}
                  disabled={
                    !transcript.trim() ||
                    (!isSimulation && !belt.connected)
                  }
                >
                  <Send className="mr-2 h-4 w-4" />
                  ✅ Confirm &amp; Send to Collar
                </Button>

                {!isSimulation && !belt.connected && (
                  <p className="text-center text-xs text-red-500">
                    Belt is not connected. Please connect the belt or enable
                    Simulation Mode.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  BROADCASTING STATUS                                             */}
      {/* ================================================================ */}
      <AnimatePresence>
        {phase === "broadcasting" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-sky-500/40 bg-sky-500/5">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-500/10">
                  <Volume2 className="h-6 w-6 animate-pulse text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="font-semibold">
                    🔊 Broadcasting command to canine belt speaker...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Playing &quot;{transcript}&quot; through the collar speaker
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  STEP 3 — MONITORING PHASE (10-second countdown)                 */}
      {/* ================================================================ */}
      <AnimatePresence>
        {phase === "monitoring" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-violet-500/40 bg-violet-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    3
                  </span>
                  📡 Monitoring Accelerometer Data
                </CardTitle>
                <CardDescription>
                  Capturing dog&apos;s posture response for {MONITORING_DURATION}{" "}
                  seconds...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isSimulation
                      ? "Simulating sensor readings..."
                      : "Reading real belt accelerometers..."}
                  </span>
                  <span className="tabular-nums font-bold">
                    {countdown}s remaining
                  </span>
                </div>
                <Progress value={progress} className="h-3" />

                <div className="flex items-center justify-center gap-2 py-2">
                  <Radio className="h-4 w-4 animate-pulse text-violet-500" />
                  <span className="text-sm text-muted-foreground">
                    {isSimulation ? "Simulation" : "Hardware"} •{" "}
                    {Math.round(progress)}% complete
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  ANALYZING SPINNER                                               */}
      {/* ================================================================ */}
      <AnimatePresence>
        {phase === "analyzing" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-amber-500/40 bg-amber-500/5">
              <CardContent className="flex flex-col items-center gap-3 py-8">
                <Cpu className="h-8 w-8 animate-spin text-amber-600 dark:text-amber-400" />
                <p className="font-semibold">
                  🧠 AI is analyzing posture data...
                </p>
                <p className="text-sm text-muted-foreground">
                  Predicting head posture, body posture &amp; atomic behavior
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  STEP 4 — RESULTS                                                */}
      {/* ================================================================ */}
      <AnimatePresence>
        {phase === "result" && sensorReadings && prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* ----- Success / Failure Banner ----- */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            >
              <Card
                className={
                  isSuccess
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-red-500/50 bg-red-500/5"
                }
              >
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                      <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        ✅ Command Followed Successfully!
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Your dog responded correctly to the &quot;{transcript}&quot; command
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-16 w-16 text-red-500" />
                      <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
                        ❌ Command Not Followed
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        The predicted posture did not match the &quot;{transcript}&quot; command
                      </p>
                    </>
                  )}
                  {saving && (
                    <p className="text-xs text-muted-foreground animate-pulse">
                      Saving to training history...
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ----- Captured Sensor Readings ----- */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" />
                  Captured Sensor Readings
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {isSimulation ? "Simulated" : "Hardware"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <StatCard icon={Activity} label="Neck X" value={String(sensorReadings.neck_x)} color="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
                  <StatCard icon={Activity} label="Neck Y" value={String(sensorReadings.neck_y)} color="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
                  <StatCard icon={Activity} label="Neck Z" value={String(sensorReadings.neck_z)} color="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
                  <StatCard icon={Activity} label="Back X" value={String(sensorReadings.back_x)} color="bg-purple-500/10 text-purple-600 dark:text-purple-400" />
                  <StatCard icon={Activity} label="Back Y" value={String(sensorReadings.back_y)} color="bg-purple-500/10 text-purple-600 dark:text-purple-400" />
                  <StatCard icon={Activity} label="Back Z" value={String(sensorReadings.back_z)} color="bg-purple-500/10 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            {/* ----- AI Prediction ----- */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cpu className="h-4 w-4 text-primary" />
                  AI Prediction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Head Posture</p>
                    <p className="mt-1 text-sm font-semibold">{prediction.head_posture}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Body Posture</p>
                    <p className="mt-1 text-sm font-semibold">{prediction.body_posture}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Atomic Behavior</p>
                    <p className="mt-1 text-sm font-semibold">{prediction.atomic_behavior}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Command Given:</span>
                  <Badge variant="outline" className="capitalize">
                    {transcript}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Result:</span>
                  <Badge
                    variant={isSuccess ? "default" : "destructive"}
                    className={isSuccess ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {isSuccess ? "Matched" : "Not Matched"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* ----- Try Again Button ----- */}
            <div className="flex gap-3">
              <Button className="flex-1" size="lg" onClick={resetSession}>
                <RotateCcw className="mr-2 h-4 w-4" />
                New Training Session
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={`/dashboard/${id}/training/progress`}>
                  View History
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
