import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/user";
import Canine from "@/lib/models/canine";
import HealthRecord from "@/lib/models/health-record";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/stats — system-wide statistics                      */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [totalUsers, totalCanines, totalRecords, totalAnomalies, users] =
      await Promise.all([
        User.countDocuments(),
        Canine.countDocuments(),
        HealthRecord.countDocuments(),
        HealthRecord.countDocuments({ aiDiagnosis: "Anomaly" }),
        User.find()
          .select("name email role createdAt")
          .sort({ createdAt: -1 })
          .lean(),
      ]);

    // Get each user's dogs
    const usersWithDogs = await Promise.all(
      users.map(async (u) => {
        const dogs = await Canine.find({ ownerId: u._id })
          .select("name breedSize age")
          .lean();
        return { ...u, dogs };
      })
    );

    return NextResponse.json({
      stats: { totalUsers, totalCanines, totalRecords, totalAnomalies },
      users: usersWithDogs,
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/stats error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
