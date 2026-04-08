import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SkinTreatment from "@/lib/models/skin-treatment";
import Canine from "@/lib/models/canine";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/health/treatments?canineId=xxx — get skin treatments      */
/* ------------------------------------------------------------------ */
export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const canineId = searchParams.get("canineId");

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

    const treatments = await SkinTreatment.find({ canineId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ treatments });
  } catch (err: unknown) {
    console.error("GET /api/health/treatments error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/health/treatments — create a new skin treatment record   */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      canineId,
      diseaseName,
      confidence,
      initialSeverityLevel,
      initialAffectedArea,
      initialImageUrl,
      initialHeartRate,
      initialTemperature,
    } = await req.json();

    // Ownership check
    const canine = await Canine.findById(canineId);
    if (!canine)
      return NextResponse.json({ error: "Dog not found." }, { status: 404 });

    if (
      session.role !== "admin" &&
      canine.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const treatment = await SkinTreatment.create({
      canineId,
      ownerId: session.userId,
      diseaseName,
      confidence,
      initialSeverityLevel,
      initialAffectedArea,
      initialImageUrl,
      initialHeartRate,
      initialTemperature,
      status: "Diagnosed",
      progressLogs: [],
    });

    return NextResponse.json({ treatment }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/health/treatments error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
