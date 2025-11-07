import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { User } from "@/models/User"
import connectDB from "@/lib/connectDB"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id } = await params

    // Prevent deleting the admin user
    const doctor = await User.findById(id)
    if (!doctor || doctor.role !== "doctor") {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({ message: "Doctor deleted successfully" })
  } catch (error) {
    console.error("Error deleting doctor:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
