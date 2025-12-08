"use client"

import { useEffect, useRef, useState } from "react"
import { Loader, MapPin, Check } from "lucide-react"

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
}

declare global {
  interface Window {
    google: any
  }
}

export default function LocationPicker({
  onLocationChange,
  initialLat = 6.927079,
  initialLng = 80.771449,
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [userLocationFound, setUserLocationFound] = useState(false)

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
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  const initializeMap = () => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocationFound(true)
          createMap(latitude, longitude)
        },
        () => {
          // Fallback to default location
          createMap(initialLat, initialLng)
        }
      )
    } else {
      createMap(initialLat, initialLng)
    }
  }

  const createMap = (centerLat: number, centerLng: number) => {
    if (!mapContainer.current || map.current) return

    map.current = new window.google.maps.Map(mapContainer.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 15,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: false,
    })

    // Add draggable marker
    markerRef.current = new window.google.maps.Marker({
      position: { lat: centerLat, lng: centerLng },
      map: map.current,
      draggable: true,
      title: "Drag to select location",
    })

    setSelectedLocation({ lat: centerLat, lng: centerLng })
    onLocationChange(centerLat, centerLng)

    // Listen to marker drag
    markerRef.current.addListener("dragend", () => {
      const position = markerRef.current!.getPosition()
      const lat = position.lat()
      const lng = position.lng()
      setSelectedLocation({ lat, lng })
      onLocationChange(lat, lng)

      // Update map center
      map.current.panTo(position)
    })

    // Click on map to set location
    map.current.addListener("click", (e: any) => {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      markerRef.current!.setPosition(e.latLng)
      setSelectedLocation({ lat, lng })
      onLocationChange(lat, lng)
    })

    setIsLoading(false)
  }

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const latLng = new window.google.maps.LatLng(latitude, longitude)

          markerRef.current!.setPosition(latLng)
          map.current.panTo(latLng)
          setSelectedLocation({ lat: latitude, lng: longitude })
          setUserLocationFound(true)
          onLocationChange(latitude, longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-300">
        <div
          ref={mapContainer}
          style={{ width: "100%", height: "100%" }}
          className="rounded-lg"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <Loader className="w-8 h-8 text-lime-500 animate-spin" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="flex-1 px-4 py-2 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          Use My Location
        </button>
        {selectedLocation && (
          <div className="flex-1 px-4 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2 text-sm text-green-700 font-medium">
            <Check className="w-4 h-4" />
            Location Selected
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
          <p>
            <strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}
          </p>
          <p>
            <strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}
