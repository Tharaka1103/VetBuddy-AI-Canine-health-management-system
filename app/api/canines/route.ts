import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Canine from "@/lib/models/canine";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/canines — list user's dogs (or all for admin)             */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    await connectDB();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filter =
      session.role === "admin" ? {} : { ownerId: session.userId };
    const canines = await Canine.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ canines });
  } catch (err: unknown) {
    console.error("GET /api/canines error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/canines — register a new dog                             */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, breedSize, age, image } = await req.json();

    if (!name || !breedSize || age === undefined) {
      return NextResponse.json(
        { error: "name, breedSize, and age are required." },
        { status: 400 }
      );
    }

    const canine = await Canine.create({
      ownerId: session.userId,
      name,
      breedSize,
      age,
      image: image || "/placeholder-dog.png",
    });

    return NextResponse.json({ canine }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/canines error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
