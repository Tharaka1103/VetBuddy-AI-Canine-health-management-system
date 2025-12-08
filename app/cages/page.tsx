"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    MapPin,
    Plus,
    Search,
    MapIcon,
    Phone,
    Clock,
    Star,
    ChevronRight,
    Filter,
    User,
    Bell,
    CheckCircle,
} from "lucide-react";
import GoogleMap from "@/components/cages/GoogleMap"
import CareCenter from "@/components/cages/CareCenter"

interface Location {
    latitude: number;
    longitude: number;
    address: string;
}

interface Medicine {
    id: string;
    name: string;
}

interface CareCenter {
    id: string;
    name: string;
    type: "house" | "care-center" | "vet-clinic" | "pet-grooming";
    image: string;
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
    medicines: Medicine[];
    services: string[];
    capacity: number;
    availableBeds: number;
    isVerified: boolean;
}

const mockCareCenters: CareCenter[] = [
    {
        id: "1",
        name: "Happy Paws Care Center",
        type: "care-center",
        image: "/care-center-1.jpg",
        location: {
            latitude: 6.921467,
            longitude: 79.975533,
            address: "123 Main Road, Kaduwela, Sri Lanka",
        },
        owner: {
            name: "Sanath Fernando",
            phone: "+94-11-555-0101",
        },
        rating: 4.8,
        reviews: 245,
        distance: 2.5,
        description:
            "Professional care center with experienced staff and modern facilities for dogs",
        operatingHours: {
            open: "08:00",
            close: "20:00",
        },
        medicines: [
            { id: "1", name: "Amoxicillin" },
            { id: "2", name: "Cephalexin" },
            { id: "3", name: "Prednisone" },
        ],
        services: ["Boarding", "Grooming", "Medical Care", "Training"],
        capacity: 50,
        availableBeds: 12,
        isVerified: true,
    },
    {
        id: "2",
        name: "Sunny Hills Vet Clinic",
        type: "vet-clinic",
        image: "/care-center-2.jpg",
        location: {
            latitude: 6.933135,
            longitude: 79.988365,
            address: "456 Colombo Road, Malabe, Sri Lanka",
        },
        owner: {
            name: "Dr. Priya Sharma",
            phone: "+94-11-555-0102",
        },
        rating: 4.9,
        reviews: 312,
        distance: 1.8,
        description:
            "Full-service veterinary clinic with emergency care and specialized treatments",
        operatingHours: {
            open: "09:00",
            close: "18:00",
        },
        medicines: [
            { id: "1", name: "Doxycycline" },
            { id: "2", name: "Fluconazole" },
            { id: "3", name: "Metronidazole" },
        ],
        services: ["Veterinary Care", "Surgery", "Dental Care", "Vaccinations"],
        capacity: 30,
        availableBeds: 5,
        isVerified: true,
    },
    {
        id: "3",
        name: "Cozy Dog House",
        type: "house",
        image: "/care-center-3.jpg",
        location: {
            latitude: 6.907940,
            longitude: 79.971146

,
            address: "789 Jayarathne Lane, Kaduwela, Sri Lanka",
        },
        owner: {
            name: "Nimali Silva",
            phone: "+94-11-555-0103",
        },
        rating: 4.6,
        reviews: 128,
        distance: 3.2,
        description:
            "Friendly home-based boarding service with personalized dog care",
        operatingHours: {
            open: "07:00",
            close: "21:00",
        },
        medicines: [
            { id: "1", name: "Aspirin" },
            { id: "2", name: "Ibuprofen" },
        ],
        services: ["Boarding", "Walking", "Feeding", "Play Time"],
        capacity: 8,
        availableBeds: 2,
        isVerified: false,
    },
    {
        id: "4",
        name: "Grooming Paradise",
        type: "pet-grooming",
        image: "/care-center-4.jpg",
        location: {
            latitude: 6.8420,
            longitude: 80.6200,
            address: "321 Colombo Road, Nugegoda, Sri Lanka",
        },
        owner: {
            name: "Roshan De Silva",
            phone: "+94-11-555-0104",
        },
        rating: 4.7,
        reviews: 189,
        distance: 2.1,
        description: "Professional grooming and spa services for your beloved pets",
        operatingHours: {
            open: "09:00",
            close: "19:00",
        },
        medicines: [
            { id: "1", name: "Medicated Shampoo" },
            { id: "2", name: "Skin Cream" },
        ],
        services: ["Grooming", "Bathing", "Nail Trimming", "Spa Treatments"],
        capacity: 20,
        availableBeds: 8,
        isVerified: true,
    },
    {
        id: "5",
        name: "Professional Dog Care",
        type: "care-center",
        image: "/care-center-5.jpg",
        location: {
            latitude: 6.8450,
            longitude: 80.6300,
            address: "555 Wellawatte Road, Malabe, Sri Lanka",
        },
        owner: {
            name: "Amila Jayakody",
            phone: "+94-11-555-0105",
        },
        rating: 4.8,
        reviews: 267,
        distance: 1.5,
        description:
            "Expert care center offering boarding, training, and medical services",
        operatingHours: {
            open: "08:00",
            close: "20:00",
        },
        medicines: [
            { id: "1", name: "Phenobarbital" },
            { id: "2", name: "Levothyroxine" },
            { id: "3", name: "Lisinopril" },
        ],
        services: ["Boarding", "Training", "Medical Care", "Behavioral Training"],
        capacity: 40,
        availableBeds: 15,
        isVerified: true,
    },
];

export default function CagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [careCenters, setCareCenters] = useState<CareCenter[]>(mockCareCenters);
    const [filteredCenters, setFilteredCenters] = useState<CareCenter[]>(
        mockCareCenters
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const [selectedCenter, setSelectedCenter] = useState<CareCenter | null>(null);
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/signin");
            return;
        }
    }, [session, status, router]);

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10; // Round to 1 decimal place
    };

    // Handle location update from map
    const handleLocationChange = (location: { lat: number; lng: number }) => {
        setUserLocation(location);

        // Update distances for all care centers based on user location
        const updatedCenters = mockCareCenters.map((center) => ({
            ...center,
            distance: calculateDistance(
                location.lat,
                location.lng,
                center.location.latitude,
                center.location.longitude
            ),
        }));
        setCareCenters(updatedCenters);
    };

    useEffect(() => {
        let filtered = careCenters;

        if (searchQuery) {
            filtered = filtered.filter(
                (center) =>
                    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    center.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    center.location.address
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
            );
        }

        if (selectedType) {
            filtered = filtered.filter((center) => center.type === selectedType);
        }

        // Sort by distance if user location is available
        if (userLocation) {
            filtered.sort((a, b) => a.distance - b.distance);
        }

        setFilteredCenters(filtered);
    }, [searchQuery, selectedType, careCenters, userLocation]);

    const typeOptions = [
        { value: "house", label: "House", icon: "🏠" },
        { value: "care-center", label: "Care Center", icon: "🏥" },
        { value: "vet-clinic", label: "Vet Clinic", icon: "⚕️" },
        { value: "pet-grooming", label: "Grooming", icon: "✂️" },
    ];

    return (
        <div className="min-h-screen bg-white relative">
            {/* Fixed Background Text */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 blur-sm">
                <h1 className="text-[15vw] md:text-[20vw] font-black text-lime-900/20 leading-none tracking-tighter">
                    CARES
                </h1>
            </div>

            {/* Header */}
            <div className="relative z-10 bg-white/80 backdrop-blur-md top-0 mt-20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                                Care Centers Near You
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Find and book professional care for your buddy
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="relative p-2 hover:bg-gray-100 rounded-sm transition-colors">
                                <Bell className="w-6 h-6 text-gray-700" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <Link href="/profile">
                                <button className="p-2 hover:bg-gray-100 rounded-sm transition-colors">
                                    <User className="w-6 h-6 text-gray-700" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                {/* Search and Filter Bar */}
                <div className="space-y-4 mb-8">
                    <div className="flex gap-4 flex-col md:flex-row">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search care centers, medicines, services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-sm focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                            />
                        </div>
                        <Link href="/cages/add">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2.5 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" />
                                Add Care Center
                            </motion.button>
                        </Link>
                    </div>

                    {/* View Mode Toggle and Type Filter */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setViewMode("list")}
                                className={`px-4 py-2 rounded-sm font-medium transition-all ${viewMode === "list"
                                    ? "bg-lime-400/50 text-black"
                                    : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                List View
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setViewMode("map")}
                                className={`px-4 py-2 rounded-sm font-medium transition-all flex items-center gap-2 ${viewMode === "map"
                                    ? "bg-lime-400/50 text-black"
                                    : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                <MapIcon className="w-4 h-4" />
                                Map
                            </motion.button>
                        </div>

                        {/* Type Filter Pills */}
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() =>
                                    setSelectedType(
                                        selectedType === null ? null : null
                                    )
                                }
                                className={`px-3 py-2 rounded-sm font-medium transition-all text-sm ${selectedType === null
                                    ? "bg-lime-400/50 text-black"
                                    : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                All
                            </button>
                            {typeOptions.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() =>
                                        setSelectedType(
                                            selectedType === type.value ? null : type.value
                                        )
                                    }
                                    className={`px-3 py-2 rounded-sm font-medium transition-all text-sm flex items-center gap-1 ${selectedType === type.value
                                        ? "bg-lime-400/50 text-black"
                                        : "bg-gray-200 text-gray-700"
                                        }`}
                                >
                                    <span>{type.icon}</span>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* View Content */}
                {viewMode === "list" ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-lime-200/20 rounded-sm backdrop-blur-sm p-4 text-black shadow-lg"
                            >
                                <div className="text-2xl font-black mb-1">
                                    {filteredCenters.length}
                                </div>
                                <div className="text-xs opacity-90">Available Centers</div>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-lime-200/20 rounded-sm backdrop-blur-sm p-4 text-black shadow-lg"
                            >
                                <div className="text-2xl font-black mb-1">
                                    {filteredCenters.reduce(
                                        (sum, c) => sum + c.availableBeds,
                                        0
                                    )}
                                </div>
                                <div className="text-xs opacity-90">Available Beds</div>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-lime-200/20 rounded-sm backdrop-blur-sm p-4 text-black shadow-lg"
                            >
                                <div className="text-2xl font-black mb-1">
                                    {(
                                        filteredCenters.reduce((sum, c) => sum + c.rating, 0) /
                                        filteredCenters.length
                                    ).toFixed(1)}
                                </div>
                                <div className="text-xs opacity-90">Avg Rating</div>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-lime-200/20 rounded-sm backdrop-blur-sm p-4 text-black shadow-lg"
                            >
                                <div className="text-2xl font-black mb-1">
                                    {filteredCenters.reduce((sum, c) => sum + c.services.length, 0)}
                                </div>
                                <div className="text-xs opacity-90">Total Services</div>
                            </motion.div>
                        </div>

                        {/* Care Centers List */}
                        <div className="space-y-4">
                            {filteredCenters.length > 0 ? (
                                filteredCenters.map((center, index) => (
                                    <motion.div
                                        key={center.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        className="bg-lime-200/20 border border-lime-400 rounded-sm overflow-hidden hover:shadow-xl transition-all"
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            {/* Image */}
                                            <div className="md:w-64 h-48 md:h-auto bg-lime-400/30 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-16 h-16 text-green-500" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-xl font-bold text-gray-900">
                                                                {center.name}
                                                            </h3>
                                                            {center.isVerified && (
                                                                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                                    <span className="text-xs font-semibold text-green-700">
                                                                        Verified
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {center.type.replace("-", " ").toUpperCase()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 mb-2">
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-bold text-gray-900">
                                                                {center.rating}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                ({center.reviews})
                                                            </span>
                                                        </div>
                                                        <div className="text-sm font-semibold text-lime-600">
                                                            {center.distance} km away
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-4">
                                                    {center.description}
                                                </p>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Operating Hours
                                                        </p>
                                                        <div className="flex items-center gap-1 text-sm font-medium">
                                                            <Clock className="w-4 h-4" />
                                                            {center.operatingHours.open} -{" "}
                                                            {center.operatingHours.close}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Owner</p>
                                                        <div className="text-sm font-medium">
                                                            {center.owner.name}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Available Beds
                                                        </p>
                                                        <div className="text-sm font-medium">
                                                            {center.availableBeds}/{center.capacity}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Contact</p>
                                                        <div className="flex items-center gap-1 text-sm font-medium">
                                                            <Phone className="w-4 h-4" />
                                                            {center.owner.phone}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Services */}
                                                <div className="mb-4">
                                                    <p className="text-xs text-gray-500 mb-2">Services</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {center.services.slice(0, 3).map((service) => (
                                                            <span
                                                                key={service}
                                                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                                            >
                                                                {service}
                                                            </span>
                                                        ))}
                                                        {center.services.length > 3 && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                                +{center.services.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-4">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setSelectedCenter(center)}
                                                        className="flex-1 px-4 py-2 border-2 border-lime-400 text-black font-semibold rounded-sm hover:bg-lime-100 transition-colors"
                                                    >
                                                        View More
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="flex-1 px-4 py-2 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-sm transition-colors"
                                                    >
                                                        Book Now
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="bg-lime-200/20 border border-lime-400 rounded-sm p-12 text-center">
                                    <p className="text-gray-600 text-lg">
                                        No care centers found matching your criteria
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-[600px] rounded-lg overflow-hidden border border-lime-400">
                        <GoogleMap
                            centers={filteredCenters}
                            onSelectCenter={(center) =>
                                setSelectedCenter(center as unknown as CareCenter)
                            }
                            onLocationChange={handleLocationChange}
                        />
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedCenter && (
                <CareCenter
                    center={selectedCenter}
                    onClose={() => setSelectedCenter(null)}
                />
            )}
        </div>
    );
}
