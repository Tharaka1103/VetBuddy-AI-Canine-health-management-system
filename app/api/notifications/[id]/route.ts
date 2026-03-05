import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/lib/models/notification";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  PATCH /api/notifications/[id] — mark as read                       */
/* ------------------------------------------------------------------ */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const notification = await Notification.findById(id);
    if (!notification)
      return NextResponse.json({ error: "Not found." }, { status: 404 });

    if (
      session.role !== "admin" &&
      notification.userId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    notification.isRead = true;
    await notification.save();

    return NextResponse.json({ notification });
  } catch (err: unknown) {
    console.error("PATCH /api/notifications/[id] error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
