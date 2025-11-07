import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Dog } from "@/models/Dog";
import connectDB from "@/lib/connectDB";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const dog = await Dog.findOne({
      _id: id,
      ownerId: (session.user as any).id
    });

    if (!dog) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 });
    }

    return NextResponse.json({ medications: dog.medications });
  } catch (error) {
    console.error("Error fetching medications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: "Medication name is required" },
        { status: 400 }
      );
    }

    const dog = await Dog.findOneAndUpdate(
      { _id: id, ownerId: (session.user as any).id },
      { $push: { medications: name.trim() } },
      { new: true }
    );

    if (!dog) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 });
    }

    return NextResponse.json({ medications: dog.medications });
  } catch (error) {
    console.error("Error adding medication:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { index, name } = body;

    if (typeof index !== 'number' || index < 0 || !name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: "Valid index and medication name are required" },
        { status: 400 }
      );
    }

    const dog = await Dog.findOne({
      _id: id,
      ownerId: (session.user as any).id
    });

    if (!dog) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 });
    }

    if (index >= dog.medications.length) {
      return NextResponse.json(
        { error: "Invalid medication index" },
        { status: 400 }
      );
    }

    dog.medications[index] = name.trim();
    await dog.save();

    return NextResponse.json({ medications: dog.medications });
  } catch (error) {
    console.error("Error updating medication:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { index } = body;

    if (typeof index !== 'number' || index < 0) {
      return NextResponse.json(
        { error: "Valid index is required" },
        { status: 400 }
      );
    }

    const dog = await Dog.findOne({
      _id: id,
      ownerId: (session.user as any).id
    });

    if (!dog) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 });
    }

    if (index >= dog.medications.length) {
      return NextResponse.json(
        { error: "Invalid medication index" },
        { status: 400 }
      );
    }

    dog.medications.splice(index, 1);
    await dog.save();

    return NextResponse.json({ medications: dog.medications });
  } catch (error) {
    console.error("Error deleting medication:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
