import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/lib/models/notification";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/notifications — user's notifications                      */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter =
      session.role === "admin" ? {} : { userId: session.userId };
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ notifications });
  } catch (err: unknown) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
