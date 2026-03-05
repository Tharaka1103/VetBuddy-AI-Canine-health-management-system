import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/lib/models/notification";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  PATCH /api/notifications/mark-all — mark all as read               */
/* ------------------------------------------------------------------ */
export async function PATCH() {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter =
      session.role === "admin"
        ? { isRead: false }
        : { userId: session.userId, isRead: false };

    await Notification.updateMany(filter, { isRead: true });

    return NextResponse.json({ message: "All notifications marked as read." });
  } catch (err: unknown) {
    console.error("PATCH /api/notifications/mark-all error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
