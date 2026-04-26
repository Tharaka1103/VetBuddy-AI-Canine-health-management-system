import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TrainingSession from "@/lib/models/training-session";
import Canine from "@/lib/models/canine";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/training?dogId=xxx — get training sessions for a dog      */
/* ------------------------------------------------------------------ */
export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const dogId = searchParams.get("dogId");

    if (!dogId)
      return NextResponse.json(
        { error: "dogId query param required." },
        { status: 400 }
      );

    const canine = await Canine.findById(dogId).lean();
    if (!canine)
      return NextResponse.json({ error: "Dog not found." }, { status: 404 });

    if (
      session.role !== "admin" &&
      canine.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const records = await TrainingSession.find({ dogId })
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json({ sessions: records });
  } catch (err: unknown) {
    console.error("GET /api/training error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/training — save a training session result                */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      dogId,
      commandGiven,
      language,
      headPosture,
      bodyPosture,
      atomicBehavior,
      isSuccessful,
    } = await req.json();

    const canine = await Canine.findById(dogId);
    if (!canine)
      return NextResponse.json({ error: "Dog not found." }, { status: 404 });

    if (
      session.role !== "admin" &&
      canine.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const record = await TrainingSession.create({
      dogId,
      commandGiven,
      language: language || "en",
      headPosture,
      bodyPosture,
      atomicBehavior,
      isSuccessful,
    });

    return NextResponse.json({ session: record }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/training error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
