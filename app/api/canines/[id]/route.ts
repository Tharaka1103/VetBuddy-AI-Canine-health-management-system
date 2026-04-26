import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Canine from "@/lib/models/canine";
import { getSession } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  GET /api/canines/[id]                                              */
/* ------------------------------------------------------------------ */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const canine = await Canine.findById(id).lean();
    if (!canine)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Ownership check for non-admin
    if (
      session.role !== "admin" &&
      canine.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ canine });
  } catch (err: unknown) {
    console.error("GET /api/canines/[id] error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PUT /api/canines/[id]  — Update dog details                        */
/* ------------------------------------------------------------------ */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const canine = await Canine.findById(id);
    if (!canine)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Ownership check for non-admin
    if (
      session.role !== "admin" &&
      canine.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, breedSize, age } = body;

    // Validate fields
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
      canine.name = name.trim();
    }

    if (breedSize !== undefined) {
      if (!["Small", "Medium", "Large"].includes(breedSize)) {
        return NextResponse.json(
          { error: "Breed size must be Small, Medium, or Large" },
          { status: 400 }
        );
      }
      canine.breedSize = breedSize;
    }

    if (age !== undefined) {
      const numAge = Number(age);
      if (isNaN(numAge) || numAge < 0 || numAge > 30) {
        return NextResponse.json(
          { error: "Age must be between 0 and 30" },
          { status: 400 }
        );
      }
      canine.age = numAge;
    }

    await canine.save();
    return NextResponse.json({ canine });
  } catch (err: unknown) {
    console.error("PUT /api/canines/[id] error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/canines/[id]  — Delete a dog                           */
/* ------------------------------------------------------------------ */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const canine = await Canine.findById(id);
    if (!canine)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Ownership check for non-admin
    if (
      session.role !== "admin" &&
      canine.ownerId.toString() !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await canine.deleteOne();
    return NextResponse.json({ message: "Dog deleted successfully" });
  } catch (err: unknown) {
    console.error("DELETE /api/canines/[id] error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
