import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CareCenter from "@/lib/models/care-center";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/clinics/[id] — get a single care center by ID             */
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
    const clinic = await CareCenter.findById(id).lean();

    if (!clinic) {
      return NextResponse.json(
        { error: "Care center not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ clinic });
  } catch (err: unknown) {
    console.error("GET /api/clinics/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
