import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CareCenter } from "@/models/CareCenter"
import connectDB from "@/lib/connectDB"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    let query: any = { isVerified: true }

    if (type && type !== "all") {
      query.type = type
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
        { services: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const careCenters = await CareCenter.find(query).lean()

    // Calculate distance if coordinates provided
    let sortedCenters = careCenters
    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)

      sortedCenters = careCenters
        .map((center) => ({
          ...center,
          distance: calculateDistance(
            userLat,
            userLng,
            center.location.latitude,
            center.location.longitude
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
    }

    return NextResponse.json(careCenters)
  } catch (error) {
    console.error("Error fetching care centers:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const {
      name,
      type,
      description,
      ownerName,
      ownerPhone,
      address,
      city,
      zipCode,
      latitude,
      longitude,
      openHour,
      closeHour,
      capacity,
      services,
      medicines,
      images,
    } = body

    // Validate required fields
    if (
      !name ||
      !type ||
      !description ||
      !ownerName ||
      !ownerPhone ||
      !address ||
      !city ||
      !zipCode ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      )
    }

    // Get user ID from session
    const sessionUserId = (session.user as any)?.id
    const sessionEmail = (session.user as any)?.email || session.user?.email
    
    if (!sessionUserId && !sessionEmail) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      )
    }

    // Get or convert user ID to ObjectId
    let userObjectId: any
    
    // If we have a valid ObjectId, use it
    if (sessionUserId && mongoose.Types.ObjectId.isValid(sessionUserId)) {
      userObjectId = new mongoose.Types.ObjectId(sessionUserId)
    } else if (sessionEmail) {
      // If we only have email (OAuth case), find the user by email and get their ID
      const { User } = await import("@/models/User")
      const dbUser = await User.findOne({ email: sessionEmail })
      if (!dbUser) {
        return NextResponse.json(
          { error: "User not found in database" },
          { status: 400 }
        )
      }
      userObjectId = dbUser._id
    } else {
      return NextResponse.json(
        { error: "Invalid user session data" },
        { status: 400 }
      )
    }

    const careCenter = await CareCenter.create({
      userId: userObjectId,
      name,
      type,
      description,
      ownerName,
      ownerPhone,
      location: {
        address,
        city,
        zipCode,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      operatingHours: {
        open: openHour || "08:00",
        close: closeHour || "20:00",
      },
      capacity: Number(capacity),
      availableBeds: Number(capacity),
      services: services || [],
      medicines: medicines || [],
      images: images || [],
      isVerified: false,
      rating: 0,
      reviews: [],
    })

    return NextResponse.json(careCenter, { status: 201 })
  } catch (error) {
    console.error("Error creating care center:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}
