"use client"

import { useEffect, useRef, useState } from "react"
import { Loader, MapPin, AlertCircle, CheckCircle2, Navigation } from "lucide-react"

interface Location {
  latitude: number
  longitude: number
  address: string
}

interface CareCenterData {
  id: string
  name: string
  type: string
  location: Location
  owner: {
    name: string
    phone: string
  }
  rating: number
  reviews: number
  distance: number
  isVerified: boolean
  image?: string
  description?: string
  operatingHours?: {
    open: string
    close: string
  }
  medicines?: Array<{ id: string; name: string }>
  services?: string[]
  capacity?: number
  availableBeds?: number
}

interface GoogleMapProps {
  centers: CareCenterData[]
  onSelectCenter: (center: CareCenterData) => void
  onLocationChange?: (location: { lat: number; lng: number }) => void
}

const typeEmojis: Record<string, string> = {
  house: "🏠",
  "care-center": "🏥",
  "vet-clinic": "⚕️",
  "pet-grooming": "✂️",
}

declare global {
  interface Window {
    google: any
  }
}

export default function GoogleMap({
  centers,
  onSelectCenter,
  onLocationChange,
}: GoogleMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationGranted, setLocationGranted] = useState(false)
  const [routeDistance, setRouteDistance] = useState<string | null>(null)
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const userMarkerRef = useRef<google.maps.Marker | null>(null)
  const routePolylineRef = useRef<google.maps.Polyline | null>(null)
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([])

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google?.maps) {
        initializeMap()
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.onload = () => {
        initializeMap()
      }
      script.onerror = () => {
        setError("Failed to load Google Maps API")
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()

    return () => {
      if (map.current) {
        google.maps.event.clearInstanceListeners(map.current)
      }
    }
  }, [])

  const initializeMap = async () => {
    if (!mapContainer.current) return

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          setLocationGranted(true)
          setError(null)
          onLocationChange?.({ lat: latitude, lng: longitude })
          createMap(latitude, longitude)
        },
        (err) => {
          console.log("Geolocation error:", err)
          setLocationGranted(false)
          // Fallback to default location (Sri Lanka)
          const fallbackLat = 6.927079
          const fallbackLng = 80.771449
          setUserLocation({ lat: fallbackLat, lng: fallbackLng })

          let errorMsg = "Location access denied. Showing default area."
          if (err.code === 1) {
            errorMsg = "Location permission denied. Showing default area."
          } else if (err.code === 2) {
            errorMsg = "Unable to get location. Showing default area."
          }
          setError(errorMsg)
          createMap(fallbackLat, fallbackLng)
        }
      )
    } else {
      setLocationGranted(false)
      const fallbackLat = 6.927079
      const fallbackLng = 80.771449
      setUserLocation({ lat: fallbackLat, lng: fallbackLng })
      setError("Geolocation not supported. Showing default area.")
      createMap(fallbackLat, fallbackLng)
    }
  }

  const createMap = (centerLat: number, centerLng: number) => {
    if (!mapContainer.current || map.current) return

    map.current = new window.google.maps.Map(mapContainer.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 13,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: false,
    })

    // Add user location marker
    userMarkerRef.current = new window.google.maps.Marker({
      position: { lat: centerLat, lng: centerLng },
      map: map.current,
      title: "Your Location",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#a3e635",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      zIndex: 10,
    })

    const userInfoWindow = new window.google.maps.InfoWindow({
      content:
        '<div style="padding: 8px; font-weight: bold;">Your Location</div>',
    })

    userMarkerRef.current.addListener("click", () => {
      // Close all other info windows
      infoWindowsRef.current.forEach((iw) => iw.close())
      userInfoWindow.open(map.current, userMarkerRef.current)
    })

    // Add care center markers
    addCareMarkers()
    setIsLoading(false)
  }

  const addCareMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.setMap(null)
    })
    infoWindowsRef.current.forEach((iw) => iw.close())
    markersRef.current = []
    infoWindowsRef.current = []

    centers.forEach((center) => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: center.location.latitude,
          lng: center.location.longitude,
        },
        map: map.current,
        title: center.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#ffffff",
          fillOpacity: 1,
          strokeColor: "#a3e635",
          strokeWeight: 3,
        },
      })

      const verificationBadge = center.isVerified
        ? '<span style="display: inline-block; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 4px;">✓ Verified</span>'
        : ""

      const infoWindowContent = `
        <div style="min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="margin-bottom: 8px;">
            <strong style="font-size: 14px; color: #111827;">${center.name}</strong>
            ${verificationBadge}
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">
            ${typeEmojis[center.type] || "📍"} ${center.type.replace("-", " ").toUpperCase()}
          </div>
          <div style="font-size: 12px; margin-bottom: 4px;">
            <span style="color: #f59e0b;">⭐ ${center.rating}</span>
            <span style="color: #6b7280;"> (${center.reviews} reviews)</span>
          </div>
          <div style="font-size: 12px; color: #059669; font-weight: 500; margin-bottom: 8px;">
            ${center.distance} km away
          </div>
          <button onclick="window.dispatchEvent(new CustomEvent('selectCenter-${center.id}'))" style="
            width: 100%;
            padding: 6px 12px;
            background: #a3e635;
            border: none;
            border-radius: 4px;
            color: black;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#84cc16'" onmouseout="this.style.background='#a3e635'">
            View Details
          </button>
        </div>
      `

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoWindowContent,
        maxWidth: 250,
      })

      infoWindowsRef.current.push(infoWindow)

      marker.addListener("click", () => {
        infoWindowsRef.current.forEach((iw) => iw.close())
        infoWindow.open(map.current, marker)
        onSelectCenter(center)
      })

      marker.addListener("mouseover", () => {
        marker.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#a3e635",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        })
        if (userLocation) {
          fetchAndDisplayRoute(
            center.location.latitude,
            center.location.longitude,
            center.id
          )
        }
      })

      marker.addListener("mouseout", () => {
        marker.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#ffffff",
          fillOpacity: 1,
          strokeColor: "#a3e635",
          strokeWeight: 3,
        })
        clearRoute()
      })

      markersRef.current.push(marker)
    })
  }

  // Handle center selection from popup
  useEffect(() => {
    const handleSelectCenter = (e: any) => {
      const centerId = e.type.replace("selectCenter-", "")
      const center = centers.find((c) => c.id === centerId)
      if (center) {
        onSelectCenter(center)
      }
    }

    centers.forEach((center) => {
      window.addEventListener(`selectCenter-${center.id}`, handleSelectCenter)
    })

    return () => {
      centers.forEach((center) => {
        window.removeEventListener(
          `selectCenter-${center.id}`,
          handleSelectCenter
        )
      })
    }
  }, [centers, onSelectCenter])

  const fetchAndDisplayRoute = async (
    centerLat: number,
    centerLng: number,
    centerId: string
  ) => {
    if (!userLocation || !map.current) return

    try {
      const response = await fetch(
        `/api/directions?originLat=${userLocation.lat}&originLng=${userLocation.lng}&destLat=${centerLat}&destLng=${centerLng}`
      )

      if (!response.ok) throw new Error("Failed to fetch directions")

      const data = await response.json()

      // Clear existing route
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null)
      }

      // Decode polyline
      const path = decodePolyline(data.overviewPolyline)

      // Draw new route
      routePolylineRef.current = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: "#a3e635",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: map.current,
      })

      setRouteDistance(data.distance)
      setHoveredRoute(centerId)
    } catch (err) {
      console.error("Error fetching route:", err)
    }
  }

  const clearRoute = () => {
    if (routePolylineRef.current && map.current) {
      routePolylineRef.current.setMap(null)
      routePolylineRef.current = null
    }
    setHoveredRoute(null)
    setRouteDistance(null)
  }

  const decodePolyline = (encoded: string): google.maps.LatLng[] => {
    const points: google.maps.LatLng[] = []
    let index = 0,
      lat = 0,
      lng = 0

    while (index < encoded.length) {
      let result = 0,
        shift = 0
      let byte: number
      do {
        byte = encoded.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)

      const dlat = result & 1 ? ~(result >> 1) : result >> 1
      lat += dlat

      result = 0
      shift = 0
      do {
        byte = encoded.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)

      const dlng = result & 1 ? ~(result >> 1) : result >> 1
      lng += dlng

      points.push(
        new window.google.maps.LatLng(lat / 1e5, lng / 1e5)
      )
    }

    return points
  }

  const handleCenterOnMe = () => {
    if (userLocation && map.current) {
      map.current.setCenter({
        lat: userLocation.lat,
        lng: userLocation.lng,
      })
      map.current.setZoom(13)
    }
  }

  useEffect(() => {
    if (centers.length > 0 && map.current) {
      addCareMarkers()
    }
  }, [centers])

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "0.5rem",
          zIndex: 1,
        }}
        className="rounded-lg"
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <Loader className="w-8 h-8 text-lime-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-700">Loading map...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">{error}</p>
            </div>
          </div>
        </div>
      )}

      {locationGranted && !isLoading && (
        <div className="absolute top-4 left-4 z-20 bg-green-50 border border-green-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">Location found</p>
          </div>
        </div>
      )}

      {routeDistance && hoveredRoute && (
        <div className="absolute top-4 right-4 z-20 bg-white/95 border-2 border-lime-400 rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <MapPin className="w-5 h-5 text-lime-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-600 uppercase">
                Road Distance
              </p>
              <p className="text-2xl font-black text-lime-600 mt-1">
                {routeDistance}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                via actual road route
              </p>
            </div>
          </div>
        </div>
      )}

      {userLocation && !isLoading && (
        <button
          onClick={handleCenterOnMe}
          className="absolute bottom-4 right-4 z-10 p-3 bg-white border-2 border-lime-400 rounded-lg hover:bg-lime-50 transition-all shadow-lg"
          title="Center map on your location"
        >
          <Navigation className="w-5 h-5 text-lime-600" />
        </button>
      )}

      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur rounded-lg shadow-lg p-4 max-w-xs">
        <div className="text-xs font-bold text-gray-900 mb-3">
          Care Center Types
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-lg">🏠</span>
            <span>House</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-lg">🏥</span>
            <span>Care Center</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-lg">⚕️</span>
            <span>Vet Clinic</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-lg">✂️</span>
            <span>Grooming</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div
              style={{
                width: "16px",
                height: "16px",
                background: "#a3e635",
                border: "2px solid white",
                borderRadius: "50%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            />
            <span>Your Location</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3">
        <div className="text-xs font-bold text-gray-900">
          {centers.length} Care Centers
        </div>
        <div className="text-xs text-gray-600">
          {userLocation ? "Near you" : "In your area"}
        </div>
      </div>
    </div>
  )
}
