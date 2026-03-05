import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Canine from "@/lib/models/canine";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/canines/[id]                                              */
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
    const canine = await Canine.findById(id).lean();
    if (!canine)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Ownership check for non-admin
    if (
      session.role !== "admin" &&
      canine.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ canine });
  } catch (err: unknown) {
    console.error("GET /api/canines/[id] error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
