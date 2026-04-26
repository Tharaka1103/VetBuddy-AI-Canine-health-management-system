import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  POST /api/vitals — Neuro-Fuzzy Hybrid Ensemble Vitals Analysis   */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { canineId, ambientTemp, dogTemp, heartRate, activityLevel, breedSize } =
      await req.json();

    // Validate required fields
    if (!canineId || !ambientTemp || !dogTemp || !heartRate || !activityLevel || !breedSize) {
      return NextResponse.json(
        { error: "Missing required fields: canineId, ambientTemp, dogTemp, heartRate, activityLevel, breedSize" },
        { status: 400 }
      );
    }

    // ---- Call Flask Neuro-Fuzzy AI backend ----
    try {
      const flaskRes = await fetch("http://localhost:5000/predict-neuro-fuzzy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Breed_Size: breedSize,
          Ambient_Temp: ambientTemp,
          Dog_Temp: dogTemp,
          Heart_Rate: heartRate,
          Activity_Level: activityLevel,
        }),
      });

      if (!flaskRes.ok) {
        const errorData = await flaskRes.json();
        return NextResponse.json(
          { error: errorData.error || "Flask AI request failed" },
          { status: flaskRes.status }
        );
      }

      const result = await flaskRes.json();
      
      return NextResponse.json({
        severity_score: result.severity_score,
        is_novel_anomaly: result.is_novel_anomaly,
        status_label: result.status_label,
      });
    } catch (flaskErr) {
      console.error("Flask Neuro-Fuzzy AI unavailable:", flaskErr);
      return NextResponse.json(
        { error: "Neuro-Fuzzy AI service unavailable. Please ensure Flask backend is running." },
        { status: 503 }
      );
    }
  } catch (err: unknown) {
    console.error("POST /api/vitals error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
