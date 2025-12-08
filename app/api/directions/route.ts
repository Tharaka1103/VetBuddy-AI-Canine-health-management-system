import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const originLat = searchParams.get("originLat")
    const originLng = searchParams.get("originLng")
    const destLat = searchParams.get("destLat")
    const destLng = searchParams.get("destLng")
    const mode = searchParams.get("mode") || "driving"

    if (!originLat || !originLng || !destLat || !destLng) {
      return NextResponse.json(
        { error: "Missing required coordinates" },
        { status: 400 }
      )
    }

    // Use Google Maps Directions API
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      )
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=${mode}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: "Unable to calculate route" },
        { status: 400 }
      )
    }

    // Extract relevant route information
    const route = data.routes[0]
    const routeData = {
      distance: route.legs[0].distance.text,
      distanceValue: route.legs[0].distance.value, // in meters
      duration: route.legs[0].duration.text,
      durationValue: route.legs[0].duration.value, // in seconds
      overviewPolyline: route.overview_polyline.points,
      steps: route.legs[0].steps.map((step: any) => ({
        instruction: step.html_instructions,
        distance: step.distance.text,
        duration: step.duration.text,
        polyline: step.polyline.points,
      })),
    }

    return NextResponse.json(routeData)
  } catch (error) {
    console.error("Error fetching directions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
