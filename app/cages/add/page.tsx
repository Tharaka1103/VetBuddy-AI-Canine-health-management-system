"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  X,
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  User,
  Bell,
  MapPin,
} from "lucide-react"
import LocationPicker from "@/components/cages/LocationPicker"

const createCareCenterSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.enum(["house", "care-center", "vet-clinic", "pet-grooming"]),
  description: z.string().min(20, "Description must be at least 20 characters"),
  ownerName: z.string().min(2, "Owner name is required"),
  ownerPhone: z
    .string()
    .regex(/^\+?[0-9\-]{10,}/, "Valid phone number required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  openHour: z.string(),
  closeHour: z.string(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  medicines: z.array(z.string()),
  services: z.array(z.string()),
  isVerified: z.boolean().optional().default(false),
});

type CreateCareCenterFormData = z.infer<typeof createCareCenterSchema>;

const availableMedicines = [
  "Amoxicillin",
  "Cephalexin",
  "Prednisone",
  "Doxycycline",
  "Fluconazole",
  "Metronidazole",
  "Phenobarbital",
  "Levothyroxine",
  "Lisinopril",
  "Aspirin",
  "Ibuprofen",
  "Medicated Shampoo",
  "Skin Cream",
];

const availableServices = [
  "Boarding",
  "Grooming",
  "Medical Care",
  "Training",
  "Walking",
  "Feeding",
  "Play Time",
  "Veterinary Care",
  "Surgery",
  "Dental Care",
  "Vaccinations",
  "Bathing",
  "Nail Trimming",
  "Spa Treatments",
  "Behavioral Training",
];

export default function AddCareCenterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<string[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentMedicineInput, setCurrentMedicineInput] = useState("");
  const [currentServiceInput, setCurrentServiceInput] = useState("");
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number>(6.927079);
  const [selectedLng, setSelectedLng] = useState<number>(80.771449);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCareCenterFormData>({
    resolver: zodResolver(createCareCenterSchema),
    defaultValues: {
      medicines: [],
      services: [],
      latitude: 40.7128,
      longitude: -74.006,
      openHour: "08:00",
      closeHour: "20:00",
      capacity: 10,
    },
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/signin");
      return;
    }
  }, [session, status, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const totalImages = selectedImages.length + newFiles.length;

      if (totalImages > 5) {
        alert(`Maximum 5 images allowed. You're trying to upload ${totalImages} images.`);
        return;
      }

      setSelectedImages([...selectedImages, ...newFiles]);

      // Create previews
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setSelectedImagePreviews(
      selectedImagePreviews.filter((_, i) => i !== index)
    );
  };

  const addMedicine = (medicine: string) => {
    if (medicine && !selectedMedicines.includes(medicine)) {
      setSelectedMedicines([...selectedMedicines, medicine]);
      setCurrentMedicineInput("");
      setShowMedicineDropdown(false);
    }
  };

  const removeMedicine = (medicine: string) => {
    setSelectedMedicines(selectedMedicines.filter((m) => m !== medicine));
  };

  const addService = (service: string) => {
    if (service && !selectedServices.includes(service)) {
      setSelectedServices([...selectedServices, service]);
      setCurrentServiceInput("");
      setShowServiceDropdown(false);
    }
  };

  const removeService = (service: string) => {
    setSelectedServices(selectedServices.filter((s) => s !== service));
  };

  const filteredMedicines = availableMedicines.filter(
    (m) =>
      m.toLowerCase().includes(currentMedicineInput.toLowerCase()) &&
      !selectedMedicines.includes(m)
  );

  const filteredServices = availableServices.filter(
    (s) =>
      s.toLowerCase().includes(currentServiceInput.toLowerCase()) &&
      !selectedServices.includes(s)
  );

  const onSubmit = async (data: CreateCareCenterFormData) => {
    setIsSubmitting(true);
    try {
      // Create care center first
      const careCenterData = {
        ...data,
        latitude: selectedLat,
        longitude: selectedLng,
        medicines: selectedMedicines,
        services: selectedServices,
      };

      const createResponse = await fetch("/api/care-centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(careCenterData),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create care center");
      }

      const careCenterResult = await createResponse.json();
      const careCenterId = careCenterResult._id;

      // Upload images if any
      if (selectedImages.length > 0) {
        const imageFormData = new FormData();
        selectedImages.forEach((file) => {
          imageFormData.append("files", file);
        });

        const uploadResponse = await fetch(
          `/api/care-centers/${careCenterId}/upload-images`,
          {
            method: "POST",
            body: imageFormData,
          }
        );

        if (!uploadResponse.ok) {
          console.error("Failed to upload images");
        }
      }

      router.push("/cages");
    } catch (error) {
      console.error("Error creating care center:", error);
      alert("Error creating care center. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Fixed Background Text */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <h1 className="text-[15vw] md:text-[20vw] font-black text-lime-900/20 leading-none tracking-tighter">
          ADD
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-lime-200/20 rounded-lg border border-lime-400 p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add Your Care Center
          </h1>
          <p className="text-gray-600 mb-8">
            Share your care center with dog owners looking for professional pet care
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Care Center Photos (Up to 5 images)
                  </label>
                  <div className="space-y-4">
                    {selectedImagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedImagePreviews.map((preview, index) => (
                          <div
                            key={index}
                            className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300 group"
                          >
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={selectedImages.length >= 5}
                        className="hidden"
                      />
                      <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Upload className="w-4 h-4" />
                        Upload Photos ({selectedImages.length}/5)
                      </div>
                    </label>
                  </div>
                </div>

                {/* Name and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Care Center Name *
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      placeholder="e.g., Happy Paws Care Center"
                      className={`w-full px-4 py-2.5 border ${
                        errors.name ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      {...register("type")}
                      className={`w-full px-4 py-2.5 border ${
                        errors.type ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                    >
                      <option value="care-center">Care Center</option>
                      <option value="house">House</option>
                      <option value="vet-clinic">Vet Clinic</option>
                      <option value="pet-grooming">Pet Grooming</option>
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.type.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    placeholder="Describe your care center, what makes it special, facilities, etc."
                    className={`w-full px-4 py-2.5 border ${
                      errors.description ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all resize-none`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (Number of Dogs) *
                  </label>
                  <input
                    {...register("capacity", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    placeholder="e.g., 20"
                    className={`w-full px-4 py-2.5 border ${
                      errors.capacity ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                  />
                  {errors.capacity && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.capacity.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Owner Information Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Owner Information
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Name *
                    </label>
                    <input
                      {...register("ownerName")}
                      type="text"
                      placeholder="Full name"
                      className={`w-full px-4 py-2.5 border ${
                        errors.ownerName ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                    />
                    {errors.ownerName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.ownerName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Phone *
                    </label>
                    <input
                      {...register("ownerPhone")}
                      type="tel"
                      placeholder="+1-555-0000"
                      className={`w-full px-4 py-2.5 border ${
                        errors.ownerPhone ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                    />
                    {errors.ownerPhone && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.ownerPhone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h2>
              <div className="space-y-6">
                {/* Location Picker Map */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Location on Map *
                  </label>
                  <LocationPicker
                    onLocationChange={(lat, lng) => {
                      setSelectedLat(lat);
                      setSelectedLng(lng);
                    }}
                    initialLat={selectedLat}
                    initialLng={selectedLng}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      {...register("address")}
                      type="text"
                      placeholder="Street address"
                      className={`w-full px-4 py-2.5 border ${
                        errors.address ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      {...register("city")}
                      type="text"
                      placeholder="City"
                      className={`w-full px-4 py-2.5 border ${
                        errors.city ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code *
                    </label>
                    <input
                      {...register("zipCode")}
                      type="text"
                      placeholder="Zip code"
                      className={`w-full px-4 py-2.5 border ${
                        errors.zipCode ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.zipCode.message}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Selected Coordinates
                    </p>
                    <p className="text-sm font-mono text-gray-900 break-all">
                      {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Operating Hours
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Time *
                  </label>
                  <input
                    {...register("openHour")}
                    type="time"
                    className={`w-full px-4 py-2.5 border ${
                      errors.openHour ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Time *
                  </label>
                  <input
                    {...register("closeHour")}
                    type="time"
                    className={`w-full px-4 py-2.5 border ${
                      errors.closeHour ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all`}
                  />
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Services Offered
              </h2>
              <div className="relative mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Services
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={currentServiceInput}
                    onChange={(e) => setCurrentServiceInput(e.target.value)}
                    onFocus={() => setShowServiceDropdown(true)}
                    placeholder="Search or type service..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                  />
                  {showServiceDropdown && filteredServices.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                      <div className="max-h-48 overflow-y-auto">
                        {filteredServices.map((service) => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => addService(service)}
                            className="w-full px-4 py-2 text-left hover:bg-lime-100 transition-colors"
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedServices.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedServices.map((service) => (
                    <div
                      key={service}
                      className="px-3 py-1 bg-lime-200/40 border border-lime-400 rounded-lg flex items-center gap-2"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {service}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeService(service)}
                        className="p-0.5 hover:bg-red-200 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medicines Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Available Medicines
              </h2>
              <div className="relative mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Medicines
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={currentMedicineInput}
                    onChange={(e) => setCurrentMedicineInput(e.target.value)}
                    onFocus={() => setShowMedicineDropdown(true)}
                    placeholder="Search or type medicine..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                  />
                  {showMedicineDropdown && filteredMedicines.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                      <div className="max-h-48 overflow-y-auto">
                        {filteredMedicines.map((medicine) => (
                          <button
                            key={medicine}
                            type="button"
                            onClick={() => addMedicine(medicine)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-100 transition-colors"
                          >
                            {medicine}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedMedicines.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedMedicines.map((medicine) => (
                    <div
                      key={medicine}
                      className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg flex items-center gap-2"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {medicine}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMedicine(medicine)}
                        className="p-0.5 hover:bg-red-200 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Link href="/cages" className="flex-1">
                <button
                  type="button"
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Adding Care Center...
                  </span>
                ) : (
                  "Add Care Center"
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
