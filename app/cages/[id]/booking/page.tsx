"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  PawPrint,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Bell,
  CheckCircle,
} from "lucide-react";

const bookingSchema = z.object({
  dogName: z.string().min(2, "Dog name is required"),
  dogBreed: z.string().optional(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  specialRequests: z.string().optional(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Mock care center data
const mockCareCenters: Record<string, any> = {
  "1": {
    id: "1",
    name: "Happy Paws Care Center",
    type: "care-center",
    ownerName: "John Smith",
    ownerPhone: "+1-555-0101",
    pricePerDay: 50,
    description: "Professional care center with experienced staff",
    availableBeds: 12,
    capacity: 50,
    isVerified: true,
  },
  "2": {
    id: "2",
    name: "Sunny Hills Vet Clinic",
    type: "vet-clinic",
    ownerName: "Dr. Sarah Johnson",
    ownerPhone: "+1-555-0102",
    pricePerDay: 75,
    description: "Full-service veterinary clinic",
    availableBeds: 5,
    capacity: 30,
    isVerified: true,
  },
  "3": {
    id: "3",
    name: "Cozy Dog House",
    type: "house",
    ownerName: "Emma Wilson",
    ownerPhone: "+1-555-0103",
    pricePerDay: 35,
    description: "Friendly home-based boarding service",
    availableBeds: 2,
    capacity: 8,
    isVerified: false,
  },
  "4": {
    id: "4",
    name: "Grooming Paradise",
    type: "pet-grooming",
    ownerName: "Michel Roberts",
    ownerPhone: "+1-555-0104",
    pricePerDay: 45,
    description: "Professional grooming and spa services",
    availableBeds: 8,
    capacity: 20,
    isVerified: true,
  },
  "5": {
    id: "5",
    name: "Professional Dog Care",
    type: "care-center",
    ownerName: "Alex Chen",
    ownerPhone: "+1-555-0105",
    pricePerDay: 60,
    description: "Expert care center offering boarding, training, and medical services",
    availableBeds: 15,
    capacity: 40,
    isVerified: true,
  },
};

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const carecenterId = params?.id as string;
  
  const careCenter = mockCareCenters[carecenterId] || mockCareCenters["1"];
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const watchCheckIn = watch("checkInDate");
  const watchCheckOut = watch("checkOutDate");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/signin");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (watchCheckIn && watchCheckOut) {
      const checkIn = new Date(watchCheckIn);
      const checkOut = new Date(watchCheckOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setTotalDays(diffDays);
      setTotalPrice(diffDays * careCenter.pricePerDay);
    }
  }, [watchCheckIn, watchCheckOut, careCenter.pricePerDay]);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const bookingData = {
        ...data,
        carecenterId,
        totalDays,
        totalPrice,
      };

      // TODO: Replace with actual API call
      console.log("Submitting booking:", bookingData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Show success message and redirect
      router.push("/cages");
    } catch (error) {
      console.error("Error creating booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeIcons: Record<string, string> = {
    "house": "🏠",
    "care-center": "🏥",
    "vet-clinic": "⚕️",
    "pet-grooming": "✂️",
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Fixed Background Text */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <h1 className="text-[15vw] md:text-[20vw] font-black text-lime-900/20 leading-none tracking-tighter">
          BOOK
        </h1>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/cages">
              <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors">
                <ChevronLeft className="w-5 h-5" />
                Back to Care Centers
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/profile">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <User className="w-6 h-6 text-gray-700" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-lime-200/20 rounded-lg border border-lime-400 p-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Book Your Stay
              </h1>
              <p className="text-gray-600 mb-8">
                Complete the form below to reserve your dog's spot
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Dog Information */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PawPrint className="w-5 h-5" />
                    Your Dog's Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dog Name *
                      </label>
                      <input
                        {...register("dogName")}
                        type="text"
                        placeholder="Enter your dog's name"
                        className={`w-full px-4 py-2.5 border ${
                          errors.dogName ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                      />
                      {errors.dogName && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.dogName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Breed (Optional)
                      </label>
                      <input
                        {...register("dogBreed")}
                        type="text"
                        placeholder="e.g., Golden Retriever"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Booking Dates
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in Date *
                      </label>
                      <input
                        {...register("checkInDate")}
                        type="date"
                        min={minDate}
                        className={`w-full px-4 py-2.5 border ${
                          errors.checkInDate
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                      />
                      {errors.checkInDate && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.checkInDate.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out Date *
                      </label>
                      <input
                        {...register("checkOutDate")}
                        type="date"
                        min={watchCheckIn || minDate}
                        className={`w-full px-4 py-2.5 border ${
                          errors.checkOutDate
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                      />
                      {errors.checkOutDate && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.checkOutDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Special Requests
                  </h2>
                  <textarea
                    {...register("specialRequests")}
                    rows={4}
                    placeholder="Any special dietary needs, medications, behavioral notes, or specific care instructions..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Terms */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start gap-3">
                    <input
                      {...register("agreeTerms")}
                      type="checkbox"
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-lime-500 focus:ring-lime-400"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the care center's terms and conditions. I understand
                      that my dog will receive professional care and any emergency
                      medical care will be at my expense.
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.agreeTerms.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Processing Booking...
                    </span>
                  ) : (
                    "Confirm Booking"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Booking Summary Sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 space-y-4"
            >
              {/* Care Center Card */}
              <div className="bg-lime-200/20 border border-lime-400 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">{typeIcons[careCenter.type]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{careCenter.name}</h3>
                      {careCenter.isVerified && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded-full">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-semibold text-green-700">
                            Verified
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      Owner: {careCenter.ownerName}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t border-lime-300 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per day:</span>
                    <span className="font-bold text-gray-900">
                      ${careCenter.pricePerDay}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available beds:</span>
                    <span className="font-bold text-gray-900">
                      {careCenter.availableBeds}/{careCenter.capacity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              {totalDays > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-6"
                >
                  <h3 className="font-bold text-gray-900 mb-4">Booking Summary</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Number of days:</span>
                      <span className="font-semibold text-gray-900">
                        {totalDays} days
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rate per day:</span>
                      <span className="font-semibold text-gray-900">
                        ${careCenter.pricePerDay}
                      </span>
                    </div>

                    <div className="border-t border-green-200 pt-3 flex justify-between">
                      <span className="font-bold text-gray-900">Total Price:</span>
                      <span className="text-xl font-black text-green-600">
                        ${totalPrice}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300 flex gap-2 text-xs text-blue-800">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Payment will be processed after the booking is confirmed
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Contact Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Contact Owner</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <a
                      href={`tel:${careCenter.ownerPhone}`}
                      className="text-sm font-semibold text-lime-600 hover:text-lime-700"
                    >
                      {careCenter.ownerPhone}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
