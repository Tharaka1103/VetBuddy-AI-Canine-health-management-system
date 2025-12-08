"use client";

import { useState } from "react";
import { MapPin, CheckCircle } from "lucide-react";

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface Medicine {
  id: string;
  name: string;
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
  isVerified: boolean;
}

interface MapProps {
  centers: CareCenterData[];
  onSelectCenter: (center: any) => void;
}

export default function Map({ centers, onSelectCenter }: MapProps) {
  const [hoveredCenter, setHoveredCenter] = useState<string | null>(null);

  const minLat = Math.min(...centers.map((c) => c.location.latitude));
  const maxLat = Math.max(...centers.map((c) => c.location.latitude));
  const minLng = Math.min(...centers.map((c) => c.location.longitude));
  const maxLng = Math.max(...centers.map((c) => c.location.longitude));

  const padding = 0.01;
  const latRange = maxLat - minLat || 0.1;
  const lngRange = maxLng - minLng || 0.1;

  const viewBoxLat = [minLat - padding, maxLat + padding];
  const viewBoxLng = [minLng - padding, maxLng + padding];

  const latToY = (lat: number) => {
    const ratio = (maxLat + padding - lat) / (maxLat + padding - (minLat - padding));
    return ratio * 600;
  };

  const lngToX = (lng: number) => {
    const ratio = (lng - (minLng - padding)) / (maxLng + padding - (minLng - padding));
    return ratio * 800;
  };

  const typeIcons: Record<string, string> = {
    "house": "🏠",
    "care-center": "🏥",
    "vet-clinic": "⚕️",
    "pet-grooming": "✂️",
  };

  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden">
      {/* SVG Base Map Grid */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Grid lines */}
        {[...Array(10)].map((_, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={(i / 10) * 800}
              y1="0"
              x2={(i / 10) * 800}
              y2="600"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1={(i / 10) * 600}
              x2="800"
              y2={(i / 10) * 600}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </g>
        ))}
      </svg>

      {/* Map Container */}
      <div className="relative w-full h-full">
        {/* Connection Lines between nearby centers */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {centers.map((center, idx) => {
            const x = lngToX(center.location.longitude);
            const y = latToY(center.location.latitude);

            // Draw line to nearest 2 neighbors
            return centers
              .slice(idx + 1, idx + 3)
              .map((neighbor) => (
                <line
                  key={`line-${center.id}-${neighbor.id}`}
                  x1={x}
                  y1={y}
                  x2={lngToX(neighbor.location.longitude)}
                  y2={latToY(neighbor.location.latitude)}
                  stroke="#86efac"
                  strokeWidth="1"
                  opacity="0.3"
                />
              ));
          })}
        </svg>

        {/* Care Center Markers */}
        {centers.map((center) => {
          const x = lngToX(center.location.longitude);
          const y = latToY(center.location.latitude);
          const isHovered = hoveredCenter === center.id;

          return (
            <div
              key={center.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all"
              style={{
                left: `${(x / 800) * 100}%`,
                top: `${(y / 600) * 100}%`,
              }}
              onMouseEnter={() => setHoveredCenter(center.id)}
              onMouseLeave={() => setHoveredCenter(null)}
            >
              {/* Marker Circle */}
              <div
                className={`relative cursor-pointer transition-all ${
                  isHovered ? "scale-125" : "scale-100"
                }`}
                onClick={() => onSelectCenter(center)}
              >
                {/* Outer Ring */}
                <div
                  className={`absolute inset-0 rounded-full transition-all ${
                    isHovered
                      ? "bg-lime-400/40 ring-2 ring-lime-500"
                      : "bg-lime-300/30"
                  }`}
                  style={{
                    width: isHovered ? "60px" : "48px",
                    height: isHovered ? "60px" : "48px",
                    left: isHovered ? "-30px" : "-24px",
                    top: isHovered ? "-30px" : "-24px",
                  }}
                />

                {/* Inner Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    isHovered
                      ? "bg-lime-500 shadow-lg scale-110"
                      : "bg-lime-400 shadow-md"
                  }`}
                >
                  {typeIcons[center.type] || "📍"}
                </div>

                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 w-56 z-20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-bold text-gray-900">
                        {center.name}
                      </div>
                      {center.isVerified && (
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 rounded-full">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-semibold text-green-700">
                            Verified
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {center.location.address}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-xs font-semibold">
                          {center.rating} ({center.reviews})
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-lime-600">
                        Owner: {center.owner.name}
                      </span>
                    </div>
                    <button className="w-full mt-2 px-2 py-1 bg-lime-400/50 hover:bg-lime-500 text-xs font-semibold rounded text-black transition-colors">
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-4 max-w-xs">
        <div className="text-xs font-bold text-gray-900 mb-3">Care Center Types</div>
        <div className="space-y-2">
          {Object.entries(typeIcons).map(([type, icon]) => (
            <div key={type} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-lg">{icon}</span>
              <span>{type.replace("-", " ")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Location Info Panel */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-4 max-w-xs">
        <div className="text-xs font-bold text-gray-900 mb-2">
          Showing {centers.length} Care Centers
        </div>
        <div className="text-xs text-gray-600">
          Click on any marker to view details
        </div>
      </div>
    </div>
  );
}
