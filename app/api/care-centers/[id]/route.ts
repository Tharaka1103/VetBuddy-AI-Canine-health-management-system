import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CareCenter } from "@/models/CareCenter"
import { User } from "@/models/User"
import connectDB from "@/lib/connectDB"
import mongoose from "mongoose"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    const careCenter = await CareCenter.findById(id).lean()

    if (!careCenter) {
      return NextResponse.json(
        { error: "Care center not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(careCenter)
  } catch (error) {
    console.error("Error fetching care center:", error)
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

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const body = await request.json()

    // Find care center and verify ownership
    const careCenter = await CareCenter.findById(id)

    if (!careCenter) {
      return NextResponse.json(
        { error: "Care center not found" },
        { status: 404 }
      )
    }

    // Get user ID from session (same logic as POST)
    const sessionUserId = (session.user as any)?.id
    const sessionEmail = (session.user as any)?.email || session.user?.email
    
    let userObjectId: any
    if (sessionUserId && mongoose.Types.ObjectId.isValid(sessionUserId)) {
      userObjectId = new mongoose.Types.ObjectId(sessionUserId)
    } else if (sessionEmail) {
      const dbUser = await User.findOne({ email: sessionEmail })
      if (!dbUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 400 }
        )
      }
      userObjectId = dbUser._id
    }
    
    if (careCenter.userId.toString() !== userObjectId.toString()) {
      return NextResponse.json(
        { error: "You don't have permission to update this care center" },
        { status: 403 }
      )
    }

    const updateData = { ...body }

    // Remove fields that shouldn't be updated
    delete updateData._id
    delete updateData.userId
    delete updateData.createdAt

    const updatedCareCenter = await CareCenter.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    return NextResponse.json(updatedCareCenter)
  } catch (error) {
    console.error("Error updating care center:", error)
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

    const careCenter = await CareCenter.findById(id)

    if (!careCenter) {
      return NextResponse.json(
        { error: "Care center not found" },
        { status: 404 }
      )
    }

    // Get user ID from session (same logic as POST)
    const sessionUserId2 = (session.user as any)?.id
    const sessionEmail2 = (session.user as any)?.email || session.user?.email
    
    let userObjectId2: any
    if (sessionUserId2 && mongoose.Types.ObjectId.isValid(sessionUserId2)) {
      userObjectId2 = new mongoose.Types.ObjectId(sessionUserId2)
    } else if (sessionEmail2) {
      const dbUser = await User.findOne({ email: sessionEmail2 })
      if (!dbUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 400 }
        )
      }
      userObjectId2 = dbUser._id
    }
    
    if (careCenter.userId.toString() !== userObjectId2.toString()) {
      return NextResponse.json(
        { error: "You don't have permission to delete this care center" },
        { status: 403 }
      )
    }

    await CareCenter.findByIdAndDelete(id)

    return NextResponse.json({
      message: "Care center deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting care center:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
