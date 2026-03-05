import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CareCenter from "@/lib/models/care-center";
import { getSession } from "@/lib/auth";
import type { PipelineStage } from "mongoose";

/* ------------------------------------------------------------------ */
/*  GET /api/clinics/nearby?lat=X&lng=Y&type=...&radius=...            */
/*  Uses MongoDB $geoNear to find clinics within radius (default 10km) */
/* ------------------------------------------------------------------ */
export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const type = searchParams.get("type") || "";
    const radiusKm = parseFloat(searchParams.get("radius") || "10");
    const is24x7 = searchParams.get("is24x7");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "lat and lng query params are required." },
        { status: 400 }
      );
    }

    // Build a match stage for optional filters
    const matchStage: Record<string, unknown> = {};
    if (type) matchStage.Facility_Type = type;
    if (is24x7 === "true") matchStage.Is_24x7 = true;

    const pipeline: PipelineStage[] = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distance_meters",
          maxDistance: radiusKm * 1000, // Convert km to meters
          spherical: true,
          query: matchStage,
        },
      },
      {
        $addFields: {
          distance_km: {
            $round: [{ $divide: ["$distance_meters", 1000] }, 2],
          },
        },
      },
      { $sort: { distance_meters: 1 } },
      { $limit: 20 },
    ];

    const clinics = await CareCenter.aggregate(pipeline);

    return NextResponse.json({ clinics });
  } catch (err: unknown) {
    console.error("GET /api/clinics/nearby error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
