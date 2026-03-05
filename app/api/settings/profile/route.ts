import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/user";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/settings/profile — get current user profile               */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findById(session.userId)
      .select("name email phone role notificationSettings createdAt")
      .lean();

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err: unknown) {
    console.error("GET /api/settings/profile error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/settings/profile — update name, email, phone            */
/* ------------------------------------------------------------------ */
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email, phone } = await req.json();

    // Check email uniqueness if changed
    if (email && email !== session.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && existing._id.toString() !== session.userId) {
        return NextResponse.json(
          { error: "Email already in use." },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(session.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("name email phone role notificationSettings createdAt");

    return NextResponse.json({ user });
  } catch (err: unknown) {
    console.error("PATCH /api/settings/profile error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
