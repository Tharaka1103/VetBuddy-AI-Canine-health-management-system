"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Users,
  UserCheck,
  Shield,
  X,
  Loader2,
  UserPlus,
  Trash2,
} from "lucide-react";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const createDoctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type CreateDoctorFormData = z.infer<typeof createDoctorSchema>;

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/signin");
      return;
    }

    if ((session.user as any).role !== "admin") {
      router.push("/dashboard");
      return;
    }

    fetchDoctors();
  }, [session, status, router]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/admin/doctors");
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDoctorFormData>({
    resolver: zodResolver(createDoctorSchema),
  });

  const onSubmit = async (data: CreateDoctorFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchDoctors();
        setShowCreateModal(false);
        reset();
      } else {
        const errorData = await response.json();
        console.error("Error creating doctor:", errorData.error);
      }
    } catch (error) {
      console.error("Error creating doctor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteDoctor = async (doctorId: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchDoctors();
      } else {
        const errorData = await response.json();
        console.error("Error deleting doctor:", errorData.error);
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Fixed Background Text */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <h1 className="text-[15vw] md:text-[20vw] font-black text-lime-900/20 leading-none tracking-tighter">
          ADMIN
        </h1>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md sticky top-0 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage doctors and system settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-lime-200/20 rounded-sm backdrop-blur-sm p-6 text-black shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8" />
              <UserCheck className="w-6 h-6 opacity-70" />
            </div>
            <div className="text-3xl font-black mb-1">1</div>
            <div className="text-sm opacity-90">Admins</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-lime-200/20 rounded-sm backdrop-blur-sm p-6 text-black shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="w-8 h-8" />
              <Users className="w-6 h-6 opacity-70" />
            </div>
            <div className="text-3xl font-black mb-1">{doctors.length}</div>
            <div className="text-sm opacity-90">Doctors</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-lime-200/20 rounded-sm backdrop-blur-sm p-6 text-black shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" />
              <UserCheck className="w-6 h-6 opacity-70" />
            </div>
            <div className="text-3xl font-black mb-1">∞</div>
            <div className="text-sm opacity-90">Users</div>
          </motion.div>
        </div>

        {/* Doctors Management */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Doctors Management
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-2.5 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Add Doctor
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white border-2 border-gray-200 rounded-sm overflow-hidden hover:border-green-500 hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-gray-600">{doctor.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDoctor(doctor._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      Doctor
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Joined: {new Date(doctor.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add Doctor Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: doctors.length * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center cursor-pointer hover:border-green-500 hover:from-green-50 hover:to-green-100 transition-all min-h-[200px]"
            >
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                  <Plus className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Add New Doctor
                </h3>
                <p className="text-sm text-gray-600">
                  Create a doctor account
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Create Doctor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Doctor
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Create a doctor account
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  reset();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8">
              <div className="space-y-6">
                {/* Basic Info */}
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
                    placeholder="Dr. John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className={`w-full px-4 py-2.5 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                    placeholder="doctor@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    {...register("password")}
                    type="password"
                    className={`w-full px-4 py-2.5 border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    reset();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-lg shadow-lg shadow-green-500/50 hover:shadow-green-500/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Creating...
                    </span>
                  ) : (
                    "Create Account"
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
