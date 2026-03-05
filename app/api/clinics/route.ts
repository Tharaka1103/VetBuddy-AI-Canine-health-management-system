import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CareCenter from "@/lib/models/care-center";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/clinics — list all care centers                           */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinics = await CareCenter.find()
      .sort({ Average_Rating: -1 })
      .lean();

    return NextResponse.json({ clinics });
  } catch (err: unknown) {
    console.error("GET /api/clinics error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
