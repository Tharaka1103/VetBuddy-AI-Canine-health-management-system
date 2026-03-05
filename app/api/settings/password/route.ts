import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/user";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  PATCH /api/settings/password — change password                     */
/* ------------------------------------------------------------------ */
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current and new passwords are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const user = await User.findById(session.userId);
    if (!user)
      return NextResponse.json({ error: "User not found." }, { status: 404 });

    const valid = await user.comparePassword(currentPassword);
    if (!valid)
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 }
      );

    user.password = newPassword;
    await user.save(); // triggers bcrypt pre-save hook

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (err: unknown) {
    console.error("PATCH /api/settings/password error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
