import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CareCenter } from "@/models/CareCenter"
import { User } from "@/models/User"
import { uploadImageToGoogleDrive } from "@/lib/googleDrive"
import connectDB from "@/lib/connectDB"
import mongoose from "mongoose"

export async function POST(
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

    // Verify ownership
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

    // Check max images limit (5 per care center)
    if (careCenter.images.length >= 5) {
      return NextResponse.json(
        { error: "Maximum 5 images allowed per care center" },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      )
    }

    // Check total images after upload
    const totalImages = careCenter.images.length + files.length
    if (totalImages > 5) {
      return NextResponse.json(
        {
          error: `Cannot upload ${files.length} images. Maximum 5 total allowed. Current: ${careCenter.images.length}`,
        },
        { status: 400 }
      )
    }

    const uploadedImages: { url: string; driveFileId: string }[] = []

    // Upload each image to Google Drive
    for (const file of files) {
      const buffer = await file.arrayBuffer()
      const fileName = `${id}-${Date.now()}-${file.name}`

      const { fileId, webViewLink } = await uploadImageToGoogleDrive(
        Buffer.from(buffer),
        fileName,
        file.type
      )

      uploadedImages.push({
        url: webViewLink,
        driveFileId: fileId,
      })
    }

    // Update care center with new images
    careCenter.images.push(
      ...uploadedImages.map((img) => ({
        url: img.url,
        driveFileId: img.driveFileId,
        uploadedAt: new Date(),
      }))
    )

    await careCenter.save()

    return NextResponse.json(
      {
        message: "Images uploaded successfully",
        images: uploadedImages,
        totalImages: careCenter.images.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error uploading images:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
