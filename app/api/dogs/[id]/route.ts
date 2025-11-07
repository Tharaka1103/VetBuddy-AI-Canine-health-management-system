import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Dog } from "@/models/Dog"
import connectDB from "@/lib/connectDB"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id } = await params

    const dog = await Dog.findOne({
      _id: id,
      ownerId: (session.user as any).id
    })

    if (!dog) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 })
    }

    return NextResponse.json({ dog })
  } catch (error) {
    console.error("Error fetching dog:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const body = await request.json()
    const updateData = { ...body }

    // Remove fields that shouldn't be updated
    delete updateData._id
    delete updateData.ownerId
    delete updateData.createdAt

    const dog = await Dog.findOneAndUpdate(
      {
        _id: id,
        ownerId: (session.user as any).id
      },
      updateData,
      { new: true, runValidators: true }
    )

    if (!dog) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 })
    }

    return NextResponse.json({ dog })
  } catch (error) {
    console.error("Error updating dog:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id } = await params

    const dog = await Dog.findOneAndDelete({
      _id: id,
      ownerId: (session.user as any).id
    })

    if (!dog) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Dog deleted successfully" })
  } catch (error) {
    console.error("Error deleting dog:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
