import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BarkHistory from "@/lib/models/bark-history";
import Canine from "@/lib/models/canine";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/barks?dogId=xxx — get bark analysis history               */
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

    const records = await BarkHistory.find({ dogId })
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json({ barks: records });
  } catch (err: unknown) {
    console.error("GET /api/barks error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/barks — save a bark analysis result                      */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { dogId, audioUrl, predictedEmotion } = await req.json();

    const canine = await Canine.findById(dogId);
    if (!canine)
      return NextResponse.json({ error: "Dog not found." }, { status: 404 });

    if (
      session.role !== "admin" &&
      canine.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const record = await BarkHistory.create({
      dogId,
      audioUrl: audioUrl || "",
      predictedEmotion,
    });

    return NextResponse.json({ bark: record }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/barks error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
