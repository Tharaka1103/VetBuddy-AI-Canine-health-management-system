"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Activity } from "lucide-react";

interface NeuroFuzzySeverityProps {
  severityScore: number;
  statusLabel: string;
  isNovelAnomaly: boolean;
}

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "normal":
      return "bg-green-500";
    case "mild":
      return "bg-yellow-500";
    case "moderate":
      return "bg-orange-500";
    case "severe":
      return "bg-red-500";
    case "critical":
      return "bg-red-600";
    default:
      return "bg-gray-500";
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "normal":
      return "default";
    case "mild":
      return "secondary";
    case "moderate":
      return "outline";
    case "severe":
    case "critical":
      return "destructive";
    default:
      return "default";
  }
};

export function NeuroFuzzySeverity({
  severityScore,
  statusLabel,
  isNovelAnomaly,
}: NeuroFuzzySeverityProps) {
  return (
    <div className="space-y-4">
      {/* Novel Anomaly Alert */}
      {isNovelAnomaly && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Novel Anomaly Detected</AlertTitle>
          <AlertDescription>
            This vitals pattern does not match known anomaly types. Please consult a veterinarian.
          </AlertDescription>
        </Alert>
      )}

      {/* Severity Score Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Severity Score</span>
          </div>
          <span className="text-sm font-bold">{severityScore}%</span>
        </div>
        <Progress 
          value={severityScore} 
          className="h-3"
        />
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        <Badge variant={getStatusVariant(statusLabel)}>
          {statusLabel}
        </Badge>
      </div>
    </div>
  );
}
