import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Dog } from "@/models/Dog"
import connectDB from "@/lib/connectDB"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const dogs = await Dog.find({ ownerId: (session.user as any).id }).sort({ createdAt: -1 })

    return NextResponse.json({ dogs })
  } catch (error) {
    console.error("Error fetching dogs:", error)
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
      breed,
      heartBeatRate,
      isHealthy,
      dailyActivityLevel,
      dailyWalkDistance,
      age,
      weight,
      sex,
      diet,
      medications,
      seizures,
      hoursOfSleep,
      annualVetVisits,
      averageTemperature
    } = body

    // Validate required fields
    if (!name || heartBeatRate === undefined || isHealthy === undefined ||
        !dailyActivityLevel || dailyWalkDistance === undefined || age === undefined ||
        weight === undefined || !sex || !diet || hoursOfSleep === undefined ||
        annualVetVisits === undefined || averageTemperature === undefined) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      )
    }

    const dog = await Dog.create({
      ownerId: (session.user as any).id,
      name,
      breed,
      heartBeatRate: Number(heartBeatRate),
      isHealthy: Boolean(isHealthy),
      dailyActivityLevel,
      dailyWalkDistance: Number(dailyWalkDistance),
      age: Number(age),
      weight: Number(weight),
      sex,
      diet,
      medications: medications || [],
      seizures: Boolean(seizures),
      hoursOfSleep: Number(hoursOfSleep),
      annualVetVisits: Number(annualVetVisits),
      averageTemperature: Number(averageTemperature)
    })

    return NextResponse.json({ dog }, { status: 201 })
  } catch (error) {
    console.error("Error creating dog:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
