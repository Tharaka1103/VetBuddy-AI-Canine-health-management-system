import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/user";
import Canine from "@/lib/models/canine";
import { getSession } from "@/lib/auth";
import { clearAuthCookie } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  DELETE /api/settings/account — delete user account                 */
/* ------------------------------------------------------------------ */
export async function DELETE() {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Delete user's dogs
    await Canine.deleteMany({ ownerId: session.userId });

    // Delete user
    await User.findByIdAndDelete(session.userId);

    // Clear auth cookie
    await clearAuthCookie();

    return NextResponse.json({ message: "Account deleted successfully." });
  } catch (err: unknown) {
    console.error("DELETE /api/settings/account error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
