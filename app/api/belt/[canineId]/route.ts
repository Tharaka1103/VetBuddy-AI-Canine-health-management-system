import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {connectDB} from "@/lib/db";
import mongoose from "mongoose";

/* ------------------------------------------------------------------ */
/*  Belt Reading Model (lightweight — stored separately from health)   */
/* ------------------------------------------------------------------ */
const beltReadingSchema = new mongoose.Schema(
  {
    canineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canine",
      required: true,
    },
    dogTemp: { type: Number, required: true },
    heartRate: { type: Number, required: true },
    ambientTemp: { type: Number, required: true },
    accelerometer: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },
    activityLevel: {
      type: String,
      enum: ["Resting", "Walking", "Running"],
      required: true,
    },
  },
  { timestamps: true }
);

beltReadingSchema.index({ canineId: 1, createdAt: -1 });

const BeltReading =
  mongoose.models.BeltReading ||
  mongoose.model("BeltReading", beltReadingSchema);

/* ------------------------------------------------------------------ */
/*  GET  /api/belt/[canineId]  —  latest readings for a canine         */
/* ------------------------------------------------------------------ */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ canineId: string }> }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { canineId } = await params;
    await connectDB();

    const limit = Number(req.nextUrl.searchParams.get("limit")) || 60;

    const readings = await BeltReading.find({ canineId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ readings: readings.reverse() });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch belt readings" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/belt/[canineId]  —  ingest a batch of readings           */
/*  (Used by a real belt device / gateway pushing data to the server)  */
/* ------------------------------------------------------------------ */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ canineId: string }> }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { canineId } = await params;
    await connectDB();

    const body = await req.json();

    // Accept a single reading or an array
    const items: Array<Record<string, unknown>> = Array.isArray(body) ? body : [body];

    const docs = items.map((item) => ({
      canineId,
      dogTemp: item.dogTemp,
      heartRate: item.heartRate,
      ambientTemp: item.ambientTemp,
      accelerometer: item.accelerometer,
      activityLevel: item.activityLevel,
    }));

    const inserted = await BeltReading.insertMany(docs);

    return NextResponse.json(
      { message: `${inserted.length} reading(s) saved`, count: inserted.length },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to save belt readings" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/belt/[canineId]  —  clear all belt data for a canine   */
/* ------------------------------------------------------------------ */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ canineId: string }> }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { canineId } = await params;
    await connectDB();

    const result = await BeltReading.deleteMany({ canineId });

    return NextResponse.json({
      message: `${result.deletedCount} reading(s) deleted`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete belt readings" },
      { status: 500 }
    );
  }
}
