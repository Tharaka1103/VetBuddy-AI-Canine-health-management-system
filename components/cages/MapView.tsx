"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader, Navigation, AlertCircle, CheckCircle2 } from "lucide-react";

interface Location {
    latitude: number;
    longitude: number;
    address: string;
}

interface CareCenterData {
  id: string;
  name: string;
  type: string;
  location: Location;
  owner: {
    name: string;
    phone: string;
  };
  rating: number;
  reviews: number;
  distance: number;
  isVerified: boolean;
  image?: string;
  description?: string;
  operatingHours?: {
    open: string;
    close: string;
  };
  medicines?: Array<{ id: string; name: string }>;
  services?: string[];
  capacity?: number;
  availableBeds?: number;
}

interface MapViewProps {
  centers: CareCenterData[];
  onSelectCenter: (center: CareCenterData) => void;
  onLocationChange?: (location: { lat: number; lng: number }) => void;
}

declare global {
    interface Window {
        L: any;
    }
}

export default function MapView({ centers, onSelectCenter, onLocationChange }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<any>(null);
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
    const [locationGranted, setLocationGranted] = useState(false);
    const [hoveredRoute, setHoveredRoute] = useState<any>(null);
    const [routeDistance, setRouteDistance] = useState<string | null>(null);
    const markersRef = useRef<any[]>([]);
    const userMarkerRef = useRef<any>(null);
    const routePolylineRef = useRef<any>(null);

    // Load Leaflet from CDN
    useEffect(() => {
        const loadLeaflet = async () => {
            if (window.L) {
                initializeMap();
                return;
            }

            // Load CSS
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href =
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
            document.head.appendChild(link);

            // Load JS
            const script = document.createElement("script");
            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
            script.onload = () => {
                initializeMap();
            };
            document.body.appendChild(script);
        };

        loadLeaflet();

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, []);

    const initializeMap = async () => {
        if (!mapContainer.current) return;

        setLocationPermissionAsked(true);

        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    setLocationGranted(true);
                    setError(null);
                    onLocationChange?.({ lat: latitude, lng: longitude });
                    createMap(latitude, longitude);
                },
                (err) => {
                    console.log("Geolocation error:", err);
                    setLocationGranted(false);
                    // Fallback to NYC (where mock data is)
                    const fallbackLat = 40.7128;
                    const fallbackLng = -74.006;
                    setUserLocation({ lat: fallbackLat, lng: fallbackLng });

                    let errorMsg = "Location access denied. Showing NYC area.";
                    if (err.code === 1) {
                        errorMsg = "Location permission denied. Showing NYC area.";
                    } else if (err.code === 2) {
                        errorMsg = "Unable to get location. Showing NYC area.";
                    }
                    setError(errorMsg);
                    createMap(fallbackLat, fallbackLng);
                }
            );
        } else {
            // Fallback
            setLocationGranted(false);
            const fallbackLat = 40.7128;
            const fallbackLng = -74.006;
            setUserLocation({ lat: fallbackLat, lng: fallbackLng });
            setError("Geolocation not supported. Showing NYC area.");
            createMap(fallbackLat, fallbackLng);
        }
    };

    const createMap = (centerLat: number, centerLng: number) => {
        const L = window.L;

        if (!map.current && mapContainer.current) {
            map.current = L.map(mapContainer.current).setView(
                [centerLat, centerLng],
                13
            );

            // Add OpenStreetMap tiles
            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                }
            ).addTo(map.current);

            // Add user location marker
            const userIcon = L.divIcon({
                className: "user-marker",
                html: `
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #a3e635 0%, #84cc16 100%);
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M12 22s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"></path>
            </svg>
          </div>
        `,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
            });

            userMarkerRef.current = L.marker([centerLat, centerLng], {
                icon: userIcon,
                title: "Your Location",
            })
                .addTo(map.current)
                .bindPopup(
                    `<div style="padding: 8px;">
          <strong>Your Location</strong>
        </div>`
                );

            // Add care center markers
            addCareMarkers();
            setIsLoading(false);
        }
    };

    const addCareMarkers = () => {
        const L = window.L;

        // Clear existing markers
        markersRef.current.forEach((marker) => {
            if (marker) {
                marker.remove();
            }
        });
        markersRef.current = [];

        const typeEmojis: Record<string, string> = {
            house: "🏠",
            "care-center": "🏥",
            "vet-clinic": "⚕️",
            "pet-grooming": "✂️",
        };

        centers.forEach((center, index) => {
            const icon = L.divIcon({
                className: "care-marker",
                html: `
          <div style="
            width: 44px;
            height: 44px;
            background: white;
            border: 3px solid #a3e635;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: all 0.3s;
          " onmouseover="this.style.transform='scale(1.2)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'">
            ${typeEmojis[center.type] || "📍"}
          </div>
        `,
                iconSize: [44, 44],
                iconAnchor: [22, 44],
                popupAnchor: [0, -44],
            });

            const verificationBadge = center.isVerified
                ? '<div style="display: inline-block; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 4px;">✓ Verified</div>'
                : "";

            const popupContent = `
        <div style="min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="margin-bottom: 8px;">
            <strong style="font-size: 14px; color: #111827;">${center.name}</strong>
            ${verificationBadge}
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">
            ${center.type.replace("-", " ").toUpperCase()}
          </div>
          <div style="font-size: 12px; margin-bottom: 4px;">
            <span style="color: #f59e0b;">⭐ ${center.rating}</span>
            <span style="color: #6b7280;"> (${center.reviews} reviews)</span>
          </div>
          <div style="font-size: 12px; color: #059669; font-weight: 500; margin-bottom: 8px;">
            ${center.distance} km away
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
            Owner: ${center.owner.name}
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
      `;

            const marker = L.marker([center.location.latitude, center.location.longitude], {
                icon: icon,
                title: center.name,
            })
                .addTo(map.current)
                .bindPopup(popupContent, {
                    maxWidth: 250,
                    closeButton: true,
                });

            marker.on("click", () => {
                onSelectCenter(center);
            });

            // Add hover listeners for route display
            marker.on("mouseover", () => {
                fetchAndDisplayRoute(
                    center.location.latitude,
                    center.location.longitude,
                    center.id
                );
            });

            marker.on("mouseout", () => {
                clearRoute();
            });

            markersRef.current.push(marker);
        });
    };

    // Handle center selection from popup
    useEffect(() => {
        const handleSelectCenter = (e: any) => {
            const centerId = e.type.replace("selectCenter-", "");
            const center = centers.find((c) => c.id === centerId);
            if (center) {
                onSelectCenter(center);
            }
        };

        centers.forEach((center) => {
            window.addEventListener(`selectCenter-${center.id}`, handleSelectCenter);
        });

        return () => {
            centers.forEach((center) => {
                window.removeEventListener(
                    `selectCenter-${center.id}`,
                    handleSelectCenter
                );
            });
        };
    }, [centers, onSelectCenter]);

    const handleCenterOnMe = () => {
      if (userLocation && map.current) {
        map.current.setView([userLocation.lat, userLocation.lng], 13);
      }
    };

    // Fetch and display route using OSRM (Open Source Routing Machine)
    const fetchAndDisplayRoute = async (
      centerLat: number,
      centerLng: number,
      centerId: string
    ) => {
      if (!userLocation) return;

      try {
        const userLat = userLocation.lat;
        const userLng = userLocation.lng;

        // OSRM API endpoint for route
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${centerLng},${centerLat}?overview=full&geometries=geojson`;

        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map((coord: any) => [
            coord[1],
            coord[0],
          ]); // Convert [lng, lat] to [lat, lng]
          const distance = (route.distance / 1000).toFixed(1); // Convert meters to km

          // Remove existing route
          if (routePolylineRef.current && map.current) {
            map.current.removeLayer(routePolylineRef.current);
          }

          // Draw new route
          const L = window.L;
          routePolylineRef.current = L.polyline(coordinates, {
            color: "#a3e635",
            weight: 4,
            opacity: 0.8,
            dashArray: "5, 5",
            className: "route-polyline",
          }).addTo(map.current);

          setRouteDistance(distance);
          setHoveredRoute(centerId);
        }
      } catch (err) {
        console.error("Error fetching route:", err);
      }
    };

    // Clear route on hover out
    const clearRoute = () => {
      if (routePolylineRef.current && map.current) {
        map.current.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }
      setHoveredRoute(null);
      setRouteDistance(null);
    };

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
                        {locationPermissionAsked && !locationGranted && (
                            <p className="text-xs text-gray-500 mt-2">
                                Requesting location access...
                            </p>
                        )}
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

            {/* Route Distance Display */}
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
                                {routeDistance} km
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                via actual road route
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Center on User Button */}
            {userLocation && !isLoading && (
                <button
                    onClick={handleCenterOnMe}
                    className="absolute bottom-4 right-4 z-10 p-3 bg-white border-2 border-lime-400 rounded-lg hover:bg-lime-50 transition-all shadow-lg"
                    title="Center map on your location"
                >
                    <Navigation className="w-5 h-5 text-lime-600" />
                </button>
            )}

            {/* Map Info Legend */}
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
                                background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
                                border: "2px solid white",
                                borderRadius: "50%",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                        />
                        <span>Your Location</span>
                    </div>
                </div>
            </div>

            {/* Centers Count */}
            <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3">
                <div className="text-xs font-bold text-gray-900">
                    {centers.length} Care Centers
                </div>
                <div className="text-xs text-gray-600">
                    {userLocation ? "Near you" : "In your area"}
                </div>
            </div>
        </div>
    );
}
