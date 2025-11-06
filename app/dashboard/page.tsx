"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  PawPrint,
  Heart,
  Activity,
  Calendar,
  Weight,
  Cake,
  X,
  Upload,
  Loader2,
  Settings,
  User,
  LogOut,
  Bell,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// Mock data for dogs
const mockDogs = [
  {
    id: "1",
    name: "Max",
    breed: "Golden Retriever",
    age: "3 years",
    weight: "32 kg",
    image: "/roy.jpg",
    healthScore: 95,
    nextVaccination: "Dec 15, 2024",
    lastCheckup: "Nov 1, 2024",
    status: "healthy",
  },
  {
    id: "2",
    name: "Luna",
    breed: "Siberian Husky",
    age: "2 years",
    weight: "24 kg",
    image: "/max.jpg",
    healthScore: 88,
    nextVaccination: "Jan 10, 2025",
    lastCheckup: "Oct 20, 2024",
    status: "healthy",
  },
  {
    id: "3",
    name: "Charlie",
    breed: "Beagle",
    age: "5 years",
    weight: "15 kg",
    image: "/rony.jpg",
    healthScore: 78,
    nextVaccination: "Dec 5, 2024",
    lastCheckup: "Nov 10, 2024",
    status: "needs-attention",
  },
];

const createDogSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  breed: z.string().min(2, "Breed must be at least 2 characters"),
  age: z.string().min(1, "Age is required"),
  weight: z.string().min(1, "Weight is required"),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  birthday: z.string().min(1, "Birthday is required"),
  color: z.string().min(2, "Color is required"),
  microchipId: z.string().optional(),
});

type CreateDogFormData = z.infer<typeof createDogSchema>;

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDogFormData>({
    resolver: zodResolver(createDogSchema),
  });

  const onSubmit = async (data: CreateDogFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("New dog data:", data);
    setIsLoading(false);
    setShowCreateModal(false);
    reset();
    setSelectedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusBadge = (status: string) => {
    if (status === "healthy")
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          Healthy
        </span>
      );
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
        Needs Attention
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Fixed Background Text */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <h1 className="text-[15vw] md:text-[20vw] font-black text-lime-900/20 leading-none tracking-tighter">
          BUDDIES
        </h1>
      </div>

      {/* Header */}
      <div className="relative z-10  bg-white/80 backdrop-blur-md sticky top-0 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                My Buddy's Board
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your furry friends' health
              </p>
            </div>
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-lime-200/20 rounded-sm backdrop-blur-sm p-6 text-black shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <PawPrint className="w-8 h-8" />
              <TrendingUp className="w-6 h-6 opacity-70" />
            </div>
            <div className="text-3xl font-black mb-1">{mockDogs.length}</div>
            <div className="text-sm opacity-90">Total Buddies</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-lime-200/20 rounded-sm backdrop-blur-sm p-6 text-black shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8" />
              <CheckCircle2 className="w-6 h-6 opacity-70" />
            </div>
            <div className="text-3xl font-black mb-1">2</div>
            <div className="text-sm opacity-90">Healthy Dogs</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-lime-200/20 rounded-sm backdrop-blur-sm p-6 text-black shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8" />
              <AlertCircle className="w-6 h-6 opacity-70" />
            </div>
            <div className="text-3xl font-black mb-1">2</div>
            <div className="text-sm opacity-90">Upcoming Vaccines</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-lime-200/20 rounded-sm backdrop-blur-sm p-6 text-black shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8" />
              <TrendingUp className="w-6 h-6 opacity-70" />
            </div>
            <div className="text-3xl font-black mb-1">87%</div>
            <div className="text-sm opacity-90">Avg Health Score</div>
          </motion.div>
        </div>

        {/* Dogs Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Your Buddies
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-3 mt-6 py-2.5 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-sm transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
              Add New Buddy
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockDogs.map((dog, index) => (
              <motion.div
                key={dog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Link href={`/dashboard/buddy/${dog.id}`}>
                  <div className="bg-white border-2 border-gray-200 rounded-sm overflow-hidden hover:border-green-500 hover:shadow-xl transition-all cursor-pointer">
                    {/* Dog Image */}
                    <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200">
                      <Image
                        src={dog.image}
                        alt={dog.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        {getStatusBadge(dog.status)}
                      </div>
                    </div>

                    {/* Dog Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {dog.name}
                          </h3>
                          <p className="text-sm text-gray-600">{dog.breed}</p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-3xl font-black ${getHealthScoreColor(
                              dog.healthScore
                            )}`}
                          >
                            {dog.healthScore}
                          </div>
                          <div className="text-xs text-gray-500">
                            Health Score
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Cake className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{dog.age} old</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Weight className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{dog.weight}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            Next vaccine: {dog.nextVaccination}
                          </span>
                        </div>
                      </div>

                      <button className="w-full mt-6 py-2.5 bg-lime-400/50 hover:bg-lime-500 text-black text-sm font-semibold rounded-sm transition-colors flex items-center justify-center">
                        View {dog.name}'s Buddy's Board
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Add New Dog Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mockDogs.length * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center cursor-pointer hover:border-green-500 hover:from-green-50 hover:to-green-100 transition-all min-h-[400px]"
            >
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                  <Plus className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Add New Buddy
                </h3>
                <p className="text-sm text-gray-600">
                  Create a health profile for your dog
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Create Dog Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Buddy
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Create a health profile for your dog
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  reset();
                  setSelectedImage(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8">
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dog Photo
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                      {selectedImage ? (
                        <Image
                          src={selectedImage}
                          alt="Dog preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <PawPrint className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-colors inline-flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </div>
                    </label>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      className={`w-full px-4 py-2.5 border ${
                        errors.name ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., Max"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Breed *
                    </label>
                    <input
                      {...register("breed")}
                      type="text"
                      className={`w-full px-4 py-2.5 border ${
                        errors.breed ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., Golden Retriever"
                    />
                    {errors.breed && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.breed.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      {...register("age")}
                      type="text"
                      className={`w-full px-4 py-2.5 border ${
                        errors.age ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., 3 years"
                    />
                    {errors.age && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.age.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight *
                    </label>
                    <input
                      {...register("weight")}
                      type="text"
                      className={`w-full px-4 py-2.5 border ${
                        errors.weight ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., 25 kg"
                    />
                    {errors.weight && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.weight.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      {...register("gender")}
                      className={`w-full px-4 py-2.5 border ${
                        errors.gender ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birthday *
                    </label>
                    <input
                      {...register("birthday")}
                      type="date"
                      className={`w-full px-4 py-2.5 border ${
                        errors.birthday ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                    />
                    {errors.birthday && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.birthday.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color *
                    </label>
                    <input
                      {...register("color")}
                      type="text"
                      className={`w-full px-4 py-2.5 border ${
                        errors.color ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., Golden"
                    />
                    {errors.color && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.color.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Microchip ID (Optional)
                    </label>
                    <input
                      {...register("microchipId")}
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="e.g., 123456789"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    reset();
                    setSelectedImage(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-lg shadow-lg shadow-green-500/50 hover:shadow-green-500/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Creating...
                    </span>
                  ) : (
                    "Create Profile"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}