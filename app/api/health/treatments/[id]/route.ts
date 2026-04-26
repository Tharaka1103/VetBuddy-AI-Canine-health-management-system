import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SkinTreatment from "@/lib/models/skin-treatment";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/health/treatments/[id] — get a single treatment           */
/* ------------------------------------------------------------------ */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const treatment = await SkinTreatment.findById(id).lean();

    if (!treatment)
      return NextResponse.json(
        { error: "Treatment not found." },
        { status: 404 }
      );

    if (
      session.role !== "admin" &&
      treatment.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ treatment });
  } catch (err: unknown) {
    console.error("GET /api/health/treatments/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/health/treatments/[id] — update status or add log       */
/* ------------------------------------------------------------------ */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const treatment = await SkinTreatment.findById(id);

    if (!treatment)
      return NextResponse.json(
        { error: "Treatment not found." },
        { status: 404 }
      );

    if (
      session.role !== "admin" &&
      treatment.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Update status if provided
    if (body.status) {
      treatment.status = body.status;
    }

    // Append a progress log if provided
    if (body.progressLog) {
      treatment.progressLogs.push({
        date: body.progressLog.date || new Date(),
        imageUrl: body.progressLog.imageUrl,
        affectedAreaPercentage: body.progressLog.affectedAreaPercentage,
        heartRate: body.progressLog.heartRate,
        temperature: body.progressLog.temperature,
        notes: body.progressLog.notes || "",
      });
    }

    await treatment.save();

    return NextResponse.json({ treatment });
  } catch (err: unknown) {
    console.error("PATCH /api/health/treatments/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
