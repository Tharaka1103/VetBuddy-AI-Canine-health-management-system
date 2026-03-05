import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/user";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/settings/notifications — get notification prefs           */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findById(session.userId)
      .select("notificationSettings")
      .lean();

    if (!user)
      return NextResponse.json({ error: "User not found." }, { status: 404 });

    return NextResponse.json({ settings: user.notificationSettings });
  } catch (err: unknown) {
    console.error("GET /api/settings/notifications error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/settings/notifications — update notification prefs      */
/* ------------------------------------------------------------------ */
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const update: Record<string, boolean> = {};
    const allowed = [
      "emailAlerts",
      "anomalyAlerts",
      "weeklyReport",
      "pushNotifications",
    ];
    for (const key of allowed) {
      if (typeof body[key] === "boolean") {
        update[`notificationSettings.${key}`] = body[key];
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid settings provided." },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(session.userId, update, {
      new: true,
    }).select("notificationSettings");

    return NextResponse.json({ settings: user?.notificationSettings });
  } catch (err: unknown) {
    console.error("PATCH /api/settings/notifications error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
