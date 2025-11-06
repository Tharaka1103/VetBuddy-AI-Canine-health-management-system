"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Shield,
  Bell,
  CreditCard,
  Key,
  Trash2,
  Loader2,
  Edit,
  CheckCircle2,
  PawPrint,
  Calendar,
  Award,
} from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 234 567 8900",
      address: "123 Main Street, Apt 4B",
      city: "New York",
      country: "United States",
      bio: "Dog lover and proud owner of 3 amazing buddies! 🐕",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Profile data:", data);
    setIsLoading(false);
    setIsEditing(false);
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

  const userStats = {
    dogsOwned: 3,
    memberSince: "January 2024",
    totalCheckups: 12,
    vaccinesCompleted: 18,
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Fixed Background Text */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <h1 className="text-[15vw] md:text-[20vw] font-black text-lime-900/20 leading-none tracking-tighter">
          PROFILE
        </h1>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 sticky top-0 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-lime-400/20 backdrop-blur-sm border-2 border-lime-400 rounded-sm p-8 mb-8 shadow-2xl shadow-green-500/20"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Profile Picture */}
            <div className="relative">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <Camera className="w-5 h-5 text-gray-700" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left text-black">
              <h1 className="text-3xl md:text-4xl font-black mb-2">
                John Doe
              </h1>
              <p className="text-lg opacity-90 mb-4">
                Dog Parent • Health Enthusiast
              </p>
              <p className="opacity-90 max-w-2xl">
                Dog lover and proud owner of 3 amazing buddies! 🐕
              </p>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2.5 bg-white text-lime-600 font-semibold rounded-sm  hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Edit className="w-5 h-5" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className=" rounded-lg p-4 text-center">
              <PawPrint className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-black">{userStats.dogsOwned}</div>
              <div className="text-sm opacity-75">Dogs Owned</div>
            </div>
            <div className=" rounded-lg p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-black">{userStats.totalCheckups}</div>
              <div className="text-sm opacity-75">Total Checkups</div>
            </div>
            <div className=" rounded-lg p-4 text-center">
              <Award className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-black">
                {userStats.vaccinesCompleted}
              </div>
              <div className="text-sm opacity-75">Vaccines Done</div>
            </div>
            <div className=" rounded-lg p-4 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-black">{userStats.memberSince}</div>
              <div className="text-sm opacity-75">Member Since</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {[
            { id: "profile", label: "Profile Information", icon: User },
            { id: "security", label: "Security", icon: Shield },
            { id: "notifications", label: "Notifications", icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
                activeTab === tab.id
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-lime-400/20 backdrop-blur-sm border-2 border-lime-400 rounded-sm p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Personal Information
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register("name")}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    } rounded-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    {...register("email")}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    {...register("phone")}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    } rounded-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    {...register("address")}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border ${
                      errors.address ? "border-red-300" : "border-gray-300"
                    } rounded-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    {...register("city")}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border ${
                      errors.city ? "border-red-300" : "border-gray-300"
                    } rounded-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    {...register("country")}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border ${
                      errors.country ? "border-red-300" : "border-gray-300"
                    } rounded-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                  {errors.country && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  {...register("bio")}
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full px-4 py-3 border ${
                    errors.bio ? "border-red-300" : "border-gray-300"
                  } rounded-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-50 disabled:text-gray-500`}
                  placeholder="Tell us about yourself and your love for dogs..."
                />
                {errors.bio && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-lime-400/50 text-black font-semibold rounded-sm hover:shadow-green-500/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        )}

        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-lime-400/20 backdrop-blur-sm border-2 border-lime-400 rounded-sm p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Security Settings
            </h2>

            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Key className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Change Password
                      </h3>
                      <p className="text-sm text-gray-600">
                        Update your password regularly to keep your account
                        secure
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-sm transition-colors">
                    Update
                  </button>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border-2 border-lime-400 text-gray-700 font-semibold rounded-sm hover:bg-gray-100 transition-colors">
                    Enable
                  </button>
                </div>
              </div>

              <div className="p-6 bg-red-50 rounded-sm border border-red-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Delete Account
                      </h3>
                      <p className="text-sm text-gray-600">
                        Permanently delete your account and all data
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-sm transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-lime-400/20 backdrop-blur-sm border-2 border-lime-400 rounded-sm p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Notification Preferences
            </h2>

            <div className="space-y-4">
              {[
                {
                  title: "Vaccination Reminders",
                  description: "Get notified before upcoming vaccinations",
                  enabled: true,
                },
                {
                  title: "Checkup Reminders",
                  description: "Reminders for scheduled vet appointments",
                  enabled: true,
                },
                {
                  title: "Medication Alerts",
                  description: "Never miss your dog's medication time",
                  enabled: true,
                },
                {
                  title: "Health Insights",
                  description: "AI-powered health recommendations",
                  enabled: true,
                },
                {
                  title: "Weight Updates",
                  description: "Track changes in your dog's weight",
                  enabled: false,
                },
                {
                  title: "Newsletter",
                  description: "Monthly tips and dog health news",
                  enabled: false,
                },
              ].map((notification, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-sm border border-gray-200"
                >
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {notification.description}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={notification.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}