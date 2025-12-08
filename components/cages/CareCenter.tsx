"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Star,
  MapPin,
  Phone,
  Clock,
  Heart,
  Share2,
  ChevronRight,
  Stethoscope,
  CheckCircle2,
  Navigation,
} from "lucide-react";

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
  type: "house" | "care-center" | "vet-clinic" | "pet-grooming";
  image?: string;
  images?: { url: string; driveFileId: string; uploadedAt: string }[];
  location: Location;
  owner: {
    name: string;
    phone: string;
  };
  rating: number;
  reviews: number;
  distance: number;
  description: string;
  operatingHours: {
    open: string;
    close: string;
  };
  medicines?: Medicine[];
  services: string[];
  capacity: number;
  availableBeds: number;
  isVerified: boolean;
}

interface CareCenterProps {
  center: CareCenterData;
  onClose: () => void;
}

const typeIcons: Record<string, string> = {
  "house": "🏠",
  "care-center": "🏥",
  "vet-clinic": "⚕️",
  "pet-grooming": "✂️",
};

export default function CareCenter({ center, onClose }: CareCenterProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchRoute(latitude, longitude);
      });
    }
  }, []);

  const fetchRoute = async (userLat: number, userLng: number) => {
    try {
      const response = await fetch(
        `/api/directions?originLat=${userLat}&originLng=${userLng}&destLat=${center.location.latitude}&destLng=${center.location.longitude}`
      );
      if (response.ok) {
        const data = await response.json();
        setRouteInfo({
          distance: data.distance,
          duration: data.duration,
        });
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const reviews = [
    {
      id: "1",
      author: "Sarah M.",
      rating: 5,
      comment: "Excellent care for my furry friend. Highly recommended!",
      date: "2 weeks ago",
    },
    {
      id: "2",
      author: "John D.",
      rating: 4,
      comment: "Great staff and clean facilities. Will visit again.",
      date: "1 month ago",
    },
    {
      id: "3",
      author: "Emma L.",
      rating: 5,
      comment: "Best care center in the area. My dog loves it here!",
      date: "1.5 months ago",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{typeIcons[center.type]}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {center.name}
                </h2>
                {center.isVerified && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">
                      Verified
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {center.type.replace("-", " ").toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Images Gallery */}
          {center.images && center.images.length > 0 ? (
            <div className="mb-6 rounded-lg overflow-hidden bg-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {center.images.map((image, index) => (
                  <div
                    key={`${image.driveFileId}-${index}`}
                    className="relative h-48 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image.url}
                      alt={`${center.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-lg overflow-hidden bg-lime-400/30 h-64 flex items-center justify-center">
              <div className="text-6xl">{typeIcons[center.type]}</div>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-lime-200/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-gray-500">Rating</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {center.rating}
              </div>
              <div className="text-xs text-gray-600">
                {center.reviews} reviews
              </div>
            </div>

            <div className="bg-lime-200/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500">Distance</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {center.distance} km
              </div>
              <div className="text-xs text-gray-600">from you</div>
            </div>

            <div className="bg-lime-200/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-lime-500" />
                <span className="text-xs text-gray-500">Hours</span>
              </div>
              <div className="text-sm font-bold text-gray-900">
                {center.operatingHours.open}
              </div>
              <div className="text-xs text-gray-600">
                to {center.operatingHours.close}
              </div>
            </div>

            <div className="bg-lime-200/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500">Capacity</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {center.availableBeds}
              </div>
              <div className="text-xs text-gray-600">beds available</div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
            <p className="text-gray-600 leading-relaxed">{center.description}</p>
          </div>

          {/* Route Information */}
          {routeInfo && userLocation && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                Route Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Distance</p>
                  <p className="text-lg font-bold text-blue-600">
                    {routeInfo.distance}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Estimated Time</p>
                  <p className="text-lg font-bold text-blue-600">
                    {routeInfo.duration}
                  </p>
                </div>
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                <Navigation className="w-4 h-4" />
                Open in Google Maps
              </button>
            </div>
          )}

          {/* Owner & Contact */}
          <div className="mb-8 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Owner Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Owner Name</p>
                <p className="text-sm font-semibold text-gray-900">
                  {center.owner.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <a
                  href={`tel:${center.owner.phone}`}
                  className="text-sm font-semibold text-lime-600 hover:text-lime-700 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {center.owner.phone}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <p className="text-sm text-gray-900 flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                  {center.location.address}
                </p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Services</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {center.services.map((service) => (
                <div
                  key={service}
                  className="bg-lime-200/20 border border-lime-400 rounded-lg p-3 text-center"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {service}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Medicines */}
          {center.medicines.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-red-500" />
                Available Medicines
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {center.medicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {medicine.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Availability</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl font-bold text-green-600">
                  {center.availableBeds}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Beds Available
                  </p>
                  <p className="text-xs text-gray-600">
                    Out of {center.capacity} total capacity
                  </p>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${(center.availableBeds / center.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Recent Reviews
            </h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.author}
                      </p>
                      <p className="text-xs text-gray-500">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-6 py-3 border-2 border-lime-400 text-black font-semibold rounded-lg hover:bg-lime-100 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </motion.button>
            <Link href={`/cages/${center.id}/booking`} className="flex-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-3 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ChevronRight className="w-5 h-5" />
                Book Now
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
