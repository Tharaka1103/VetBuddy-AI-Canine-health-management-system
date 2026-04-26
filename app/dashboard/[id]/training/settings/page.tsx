"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Volume2, Mic, Languages, Settings } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "woofy_training_settings";

interface TrainingSettings {
  voiceOutputEnabled: boolean;
  autoRecordBarks: boolean;
  defaultLanguage: "en" | "si";
}

const defaultSettings: TrainingSettings = {
  voiceOutputEnabled: true,
  autoRecordBarks: false,
  defaultLanguage: "en",
};

export default function TrainingSettingsPage() {
  const [settings, setSettings] = useState<TrainingSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage
  const updateSetting = <K extends keyof TrainingSettings>(
    key: K,
    value: TrainingSettings[K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    toast.success("Setting saved");
  };

  if (!loaded) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Training Settings
        </h1>
        <p className="text-muted-foreground">
          Configure training hub preferences. Settings are stored locally.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Preferences</CardTitle>
          </div>
          <CardDescription>
            Manage voice output, bark recording, and language defaults
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Output */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">
                  Enable Voice Output on Collar
                </Label>
                <p className="text-xs text-muted-foreground">
                  Speak commands out loud using browser speech synthesis
                </p>
              </div>
            </div>
            <Switch
              checked={settings.voiceOutputEnabled}
              onCheckedChange={(v) => updateSetting("voiceOutputEnabled", v)}
            />
          </div>

          <Separator />

          {/* Auto Record Barks */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">
                  Auto-record Barks
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically record and analyze barks when belt is connected
                </p>
              </div>
            </div>
            <Switch
              checked={settings.autoRecordBarks}
              onCheckedChange={(v) => updateSetting("autoRecordBarks", v)}
            />
          </div>

          <Separator />

          {/* Default Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">
                  Default Command Language
                </Label>
                <p className="text-xs text-muted-foreground">
                  Language used for voice commands by default
                </p>
              </div>
            </div>
            <Select
              value={settings.defaultLanguage}
              onValueChange={(v) =>
                updateSetting("defaultLanguage", v as "en" | "si")
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="si">සිංහල (Sinhala)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
