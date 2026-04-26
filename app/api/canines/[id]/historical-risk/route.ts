import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HealthRecord from "@/lib/models/health-record";
import Canine from "@/lib/models/canine";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  POST /api/canines/[id]/historical-risk                             */
/*  Compares current vitals against historical anomaly averages        */
/* ------------------------------------------------------------------ */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: canineId } = await params;

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

    const { currentBodyTemp, currentHeartRate } = await req.json();

    if (
      typeof currentBodyTemp !== "number" ||
      typeof currentHeartRate !== "number"
    ) {
      return NextResponse.json(
        { error: "currentBodyTemp and currentHeartRate are required numbers." },
        { status: 400 }
      );
    }

    // Fetch all records where AI diagnosed "Anomaly"
    const anomalyRecords = await HealthRecord.find({
      canineId,
      aiDiagnosis: "Anomaly",
    })
      .select("dogTemp heartRate")
      .lean();

    if (anomalyRecords.length === 0) {
      return NextResponse.json({
        risk: false,
        message: "No anomaly history found for this dog.",
        avgTemp: null,
        avgHR: null,
        totalAnomalies: 0,
      });
    }

    // Calculate averages from anomaly records
    const totalTemp = anomalyRecords.reduce((sum, r) => sum + r.dogTemp, 0);
    const totalHR = anomalyRecords.reduce((sum, r) => sum + r.heartRate, 0);
    const avgTemp = Number((totalTemp / anomalyRecords.length).toFixed(1));
    const avgHR = Math.round(totalHR / anomalyRecords.length);

    // Check if current vitals are nearing historical danger zone
    const tempDelta = Math.abs(currentBodyTemp - avgTemp);
    const hrDelta = Math.abs(currentHeartRate - avgHR);

    const tempAtRisk = tempDelta <= 0.5;
    const hrAtRisk = hrDelta <= 10;
    const risk = tempAtRisk || hrAtRisk;

    return NextResponse.json({
      risk,
      tempAtRisk,
      hrAtRisk,
      avgTemp,
      avgHR,
      currentBodyTemp,
      currentHeartRate,
      totalAnomalies: anomalyRecords.length,
      message: risk
        ? `Based on your dog's health history, it is usually an anomaly when the temperature increases to ${avgTemp}°C or heart rate reaches ${avgHR} bpm. The current vitals are closely approaching this danger zone. Please monitor carefully.`
        : "Current vitals are within safe range based on historical patterns.",
    });
  } catch (err: unknown) {
    console.error("POST /api/canines/[id]/historical-risk error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
