import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HealthRecord from "@/lib/models/health-record";
import Canine from "@/lib/models/canine";
import Notification from "@/lib/models/notification";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/health?canineId=xxx — get health records for a dog        */
/* ------------------------------------------------------------------ */
export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const canineId = searchParams.get("canineId");
    const all = searchParams.get("all");

    // Admin: fetch all records across the system
    if (all === "true" && session.role === "admin") {
      const records = await HealthRecord.find()
        .populate("canineId", "name")
        .sort({ timestamp: -1 })
        .lean();
      return NextResponse.json({ records });
    }

    if (!canineId)
      return NextResponse.json(
        { error: "canineId query param required." },
        { status: 400 }
      );

    // Ownership check
    const canine = await Canine.findById(canineId).lean();
    if (!canine)
      return NextResponse.json({ error: "Dog not found." }, { status: 404 });

    if (
      session.role !== "admin" &&
      canine.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const records = await HealthRecord.find({ canineId })
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json({ records });
  } catch (err: unknown) {
    console.error("GET /api/health error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/health — create a new health record + call Flask AI      */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { canineId, ambientTemp, dogTemp, heartRate, activityLevel } =
      await req.json();

    // Fetch canine for breed info & ownership check
    const canine = await Canine.findById(canineId);
    if (!canine)
      return NextResponse.json({ error: "Dog not found." }, { status: 404 });

    if (
      session.role !== "admin" &&
      canine.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ---- Call Flask AI backend ----
    let aiDiagnosis = "Healthy";
    let aiReason = "";

    try {
      const flaskRes = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Breed_Size: canine.breedSize,
          Ambient_Temp: ambientTemp,
          Dog_Temp: dogTemp,
          Heart_Rate: heartRate,
          Activity_Level: activityLevel,
        }),
      });

      if (flaskRes.ok) {
        const result = await flaskRes.json();
        aiDiagnosis = result.status || "Healthy";
        aiReason = result.reason || "";
      }
    } catch (flaskErr) {
      console.warn("Flask AI unavailable, defaulting to rule-based:", flaskErr);
      // Fallback rule-based logic when Flask is down
      if (dogTemp >= 39.5) {
        aiDiagnosis = "Anomaly";
        aiReason = "High Temperature Detected: Maybe Fever or Heat Stroke 🌡️";
      } else if (dogTemp < 37.5) {
        aiDiagnosis = "Anomaly";
        aiReason = "Low Temperature Detected: Possible Hypothermia ❄️";
      } else if (heartRate > 120 && activityLevel === "Resting") {
        aiDiagnosis = "Anomaly";
        aiReason = "High Heart Rate at Rest: Possible Tachycardia 🫀";
      } else if (heartRate < 60) {
        aiDiagnosis = "Anomaly";
        aiReason = "Low Heart Rate Detected: Lethargy or underlying issue 📉";
      }
    }

    // ---- Save health record ----
    const record = await HealthRecord.create({
      canineId,
      ambientTemp,
      dogTemp,
      heartRate,
      activityLevel,
      aiDiagnosis,
      aiReason,
    });

    // ---- Create notification if anomaly ----
    if (aiDiagnosis === "Anomaly") {
      await Notification.create({
        userId: canine.ownerId,
        canineId: canine._id,
        title: "Anomaly Detected",
        message: `${aiReason} — for ${canine.name}`,
        type: "Alert",
        isRead: false,
      });
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/health error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
