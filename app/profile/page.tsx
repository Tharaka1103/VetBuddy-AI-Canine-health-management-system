"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/signin");
      return;
    }
    fetchUserProfile();
  }, [session, status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        resetProfile({
          name: data.user.name,
          email: data.user.email,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setErrorMessage("Failed to load user profile");
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      setUser(result.user);
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      resetProfile(data);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to change password");
      }

      setSuccessMessage("Password changed successfully!");
      setShowPasswordForm(false);
      resetPassword();
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete account");
      }

      // Sign out and redirect
      await signOut({ callbackUrl: "/" });
    } catch (error: any) {
      setErrorMessage(error.message);
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  if (status === "loading" || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-green-500" />
      </div>
    );
  }

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

  // Calculate stats based on user data
  const userStats = {
    accountType: user?.role === "admin" ? "Administrator" : user?.role === "doctor" ? "Doctor" : "User",
    memberSince: user ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "",
    lastUpdated: user ? new Date(user.updatedAt).toLocaleDateString() : "",
    emailVerified: true, // Assuming email is verified for now
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

      {/* Success/Error Messages */}
        {(successMessage || errorMessage) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`mb-6 p-4 rounded-lg ${
            successMessage ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}
          >
            <p className={`text-sm ${successMessage ? "text-green-600" : "text-red-600"} text-center`}>
              {successMessage || errorMessage}
            </p>
          </motion.div>
        )}

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
                {user.name}
              </h1>
              <p className="text-lg opacity-90 mb-4">
                {user.role === "admin" ? "Administrator" : user.role === "doctor" ? "Veterinarian" : "Dog Parent"}
                {" • "}
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p className="opacity-90 max-w-2xl">
                Email: {user.email}
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
              <User className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-black">{userStats.accountType}</div>
              <div className="text-sm opacity-75">Account Type</div>
            </div>
            <div className=" rounded-lg p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-black">{userStats.memberSince}</div>
              <div className="text-sm opacity-75">Member Since</div>
            </div>
            <div className=" rounded-lg p-4 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-black">{userStats.lastUpdated}</div>
              <div className="text-sm opacity-75">Last Updated</div>
            </div>
            <div className=" rounded-lg p-4 text-center">
              <Mail className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-black">{userStats.emailVerified ? "Yes" : "No"}</div>
              <div className="text-sm opacity-75">Email Verified</div>
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

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...registerProfile("name")}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border ${
                      profileErrors.name ? "border-red-300" : "border-gray-300"
                    } rounded-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {profileErrors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    {...registerProfile("email")}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border ${
                      profileErrors.email ? "border-red-300" : "border-gray-300"
                    } rounded-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {profileErrors.email.message}
                    </p>
                  )}
                </div>
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
              {/* Change Password Section */}
              <div className="p-6 bg-gray-50 rounded-sm border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Key className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Change Password
                      </h3>
                      <p className="text-sm text-gray-600">
                        Update your password regularly to keep your account secure
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="px-4 py-2 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-sm transition-colors"
                  >
                    {showPasswordForm ? "Cancel" : "Update"}
                  </button>
                </div>

                {showPasswordForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password *
                        </label>
                        <input
                          {...registerPassword("currentPassword")}
                          type="password"
                          className={`w-full px-4 py-2 border ${
                            passwordErrors.currentPassword ? "border-red-300" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                          placeholder="Enter your current password"
                        />
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-xs text-red-600">
                            {passwordErrors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password *
                        </label>
                        <input
                          {...registerPassword("newPassword")}
                          type="password"
                          className={`w-full px-4 py-2 border ${
                            passwordErrors.newPassword ? "border-red-300" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                          placeholder="Enter your new password"
                        />
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-xs text-red-600">
                            {passwordErrors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password *
                        </label>
                        <input
                          {...registerPassword("confirmPassword")}
                          type="password"
                          className={`w-full px-4 py-2 border ${
                            passwordErrors.confirmPassword ? "border-red-300" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                          placeholder="Confirm your new password"
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-600">
                            {passwordErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Key className="w-4 h-4" />
                              Update Password
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            resetPassword();
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
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

              {/* Delete Account Section */}
              <div className="p-6 bg-red-50 rounded-sm border border-red-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Delete Account
                      </h3>
                      <p className="text-sm text-gray-600">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {showConfirmDelete && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-red-200"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-900 mb-2">Are you sure?</h4>
                        <p className="text-sm text-red-700 mb-4">
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={deleteAccount}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="animate-spin h-4 w-4" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Yes, Delete My Account
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowConfirmDelete(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
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