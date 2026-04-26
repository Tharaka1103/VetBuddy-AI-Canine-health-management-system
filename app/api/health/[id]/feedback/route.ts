import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HealthRecord from "@/lib/models/health-record";
import Canine from "@/lib/models/canine";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  PATCH /api/health/[id]/feedback — user confirms / corrects AI      */
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
    const { feedback } = await req.json();

    if (!["Correct", "Incorrect"].includes(feedback)) {
      return NextResponse.json(
        { error: "feedback must be 'Correct' or 'Incorrect'." },
        { status: 400 }
      );
    }

    const record = await HealthRecord.findById(id);
    if (!record)
      return NextResponse.json({ error: "Record not found." }, { status: 404 });

    // Ownership check
    const canine = await Canine.findById(record.canineId);
    if (
      canine &&
      session.role !== "admin" &&
      canine.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    record.userFeedback = feedback;
    await record.save();

    // ---- Send data to Flask for continuous learning ----
    if (canine) {
      const breedMap: Record<string, number> = { Small: 0, Medium: 1, Large: 2 };
      const activityMap: Record<string, number> = { Resting: 0, Walking: 1, Running: 2 };

      // Correct → keep original diagnosis; Incorrect → flip it
      const actualStatus =
        feedback === "Correct"
          ? record.aiDiagnosis
          : record.aiDiagnosis === "Anomaly"
            ? "Healthy"
            : "Anomaly";

      try {
        await fetch("http://localhost:5000/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Breed_Encoded: breedMap[canine.breedSize] ?? 1,
            Ambient_Temp: record.ambientTemp,
            Dog_Temp: record.dogTemp,
            Heart_Rate: record.heartRate,
            Activity_Encoded: activityMap[record.activityLevel] ?? 0,
            Actual_Status: actualStatus,
          }),
        });
      } catch {
        console.warn("Flask feedback endpoint unavailable.");
      }
    }

    return NextResponse.json({ record });
  } catch (err: unknown) {
    console.error("PATCH /api/health/[id]/feedback error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
