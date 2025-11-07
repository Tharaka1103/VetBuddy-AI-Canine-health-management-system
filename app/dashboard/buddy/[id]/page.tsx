"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, PawPrint } from "lucide-react";
import {
  ArrowLeft,
  Heart,
  Activity,
  Calendar,
  Weight,
  Cake,
  Syringe,
  Pill,
  Stethoscope,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Edit,
  Download,
  Share2,
  Clock,
  MapPin,
  Phone,
  FileText,
  Bell,
  Brain,
  Zap,
  ShieldCheck,
  Star,
  Trash2,
  X,
  Upload,
  Copy,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Check,
  Plus,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Dog {
  _id: string;
  name: string;
  breed?: string;
  heartBeatRate: number;
  isHealthy: boolean;
  dailyActivityLevel: "low" | "medium" | "high";
  dailyWalkDistance: number;
  age: number;
  weight: number;
  sex: "male" | "female";
  diet: string;
  medications: string[];
  seizures: boolean;
  hoursOfSleep: number;
  annualVetVisits: number;
  averageTemperature: number;
  createdAt: string;
  updatedAt: string;
}

const editDogSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  breed: z.string().optional(),
  heartBeatRate: z.number().min(0, "Heart beat rate must be positive"),
  dailyActivityLevel: z.enum(["low", "medium", "high"]),
  dailyWalkDistance: z.number().min(0, "Walk distance must be positive"),
  age: z.number().min(0, "Age must be positive"),
  weight: z.number().min(0, "Weight must be positive"),
  sex: z.enum(["male", "female"]),
  diet: z.string().min(1, "Diet is required"),
  medications: z.array(z.string()).optional(),
  seizures: z.boolean(),
  hoursOfSleep: z.number().min(0).max(24),
  annualVetVisits: z.number().min(0),
  averageTemperature: z.number().min(90).max(110),
});

type EditDogFormData = z.infer<typeof editDogSchema>;

export default function BuddyProfilePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [dog, setDog] = useState<Dog | null>(null);
  const [healthPrediction, setHealthPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [copied, setCopied] = useState(false);
  const [medications, setMedications] = useState<string[]>([]);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [newMedication, setNewMedication] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  const dogId = params.id as string;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditDogFormData>({
    resolver: zodResolver(editDogSchema),
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/signin");
      return;
    }
    fetchDog();
  }, [session, status, dogId, router]);

  const fetchDog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dogs/${dogId}`);

      if (response.status === 404) {
        setError("Dog not found");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch dog data");
      }

      const data = await response.json();
      setDog(data.dog);
      setMedications(data.dog.medications);
      await fetchHealthPrediction(data.dog);
    } catch (err: any) {
      setError(err.message || "Failed to load dog data");
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthPrediction = async (dogData: Dog) => {
    try {
      const aiInput = {
        "Daily Activity Level": dogData.dailyActivityLevel,
        "Daily Walk Distance (miles)": dogData.dailyWalkDistance,
        Age: dogData.age,
        "Weight (lbs)": dogData.weight,
        Breed: dogData.breed || "Unknown",
        Sex: dogData.sex.charAt(0).toUpperCase() + dogData.sex.slice(1),
        Diet: dogData.diet,
        Medications: dogData.medications.length > 0 ? "Yes" : "No",
        Seizures: dogData.seizures ? "Yes" : "No",
        "Hours of Sleep": dogData.hoursOfSleep,
        "Annual Vet Visits": dogData.annualVetVisits,
        "Average Temperature (F)": dogData.averageTemperature,
      };
      const response = await fetch("/api/check-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aiInput),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch health prediction");
      }
      const data = await response.json();
      setHealthPrediction(data.prediction);
    } catch (err: any) {
      console.error("Error fetching health prediction:", err);
      setHealthPrediction(null);
    }
  };

  const onEditSubmit = async (data: EditDogFormData) => {
    setIsUpdating(true);
    try {
      const updateData = { ...data, breed: data.breed || "Unknown" };
      const response = await fetch(`/api/dogs/${dogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        await fetchDog();
        setShowEditModal(false);
        reset();
      } else {
        const errorData = await response.json();
        console.error("Error updating dog:", errorData.error);
      }
    } catch (error) {
      console.error("Error updating dog:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to remove this buddy? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/dogs/${dogId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        console.error("Error deleting dog");
      }
    } catch (error) {
      console.error("Error deleting dog:", error);
    }
  };

  const handleAddMedication = async () => {
    if (!newMedication.trim()) return;
    try {
      const response = await fetch(`/api/dogs/${dogId}/medications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMedication.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setMedications(data.medications);
        setDog(prev => prev ? { ...prev, medications: data.medications } : prev);
        setNewMedication("");
        setShowAddMedication(false);
        if (dog) await fetchHealthPrediction({ ...dog, medications: data.medications });
      }
    } catch (error) {
      console.error("Error adding medication:", error);
    }
  };

  const handleEditMedication = (index: number) => {
    setEditingIndex(index);
    setEditValue(medications[index]);
  };

  const handleUpdateMedication = async () => {
    if (editingIndex === null || !editValue.trim()) return;
    try {
      const response = await fetch(`/api/dogs/${dogId}/medications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: editingIndex, name: editValue.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setMedications(data.medications);
        setDog(prev => prev ? { ...prev, medications: data.medications } : prev);
        setEditingIndex(null);
        setEditValue("");
        if (dog) await fetchHealthPrediction({ ...dog, medications: data.medications });
      }
    } catch (error) {
      console.error("Error updating medication:", error);
    }
  };

  const handleDeleteMedication = async (index: number) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;
    try {
      const response = await fetch(`/api/dogs/${dogId}/medications`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      if (response.ok) {
        const data = await response.json();
        setMedications(data.medications);
        setDog(prev => prev ? { ...prev, medications: data.medications } : prev);
        if (dog) await fetchHealthPrediction({ ...dog, medications: data.medications });
      }
    } catch (error) {
      console.error("Error deleting medication:", error);
    }
  };

  const openEditModal = () => {
    if (dog) {
      reset({
        name: dog.name,
        breed: dog.breed || "",
        heartBeatRate: dog.heartBeatRate,
        dailyActivityLevel: dog.dailyActivityLevel,
        dailyWalkDistance: dog.dailyWalkDistance,
        age: dog.age,
        weight: dog.weight,
        sex: dog.sex,
        diet: dog.diet,
        medications: dog.medications,
        seizures: dog.seizures,
        hoursOfSleep: dog.hoursOfSleep,
        annualVetVisits: dog.annualVetVisits,
        averageTemperature: dog.averageTemperature,
      });
      setShowEditModal(true);
    }
  };

  // PDF Download Function
  const handleDownloadPDF = async () => {
    if (!dog) return;

    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Helper function to add text with word wrap
      const addWrappedText = (
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineHeight: number = 6
      ) => {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + lines.length * lineHeight;
      };

      // Header - App Name
      pdf.setFillColor(132, 204, 22); // lime-500
      pdf.rect(0, 0, pageWidth, 40, "F");
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.text("WOOFY", margin, 20);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Dog Health Management System", margin, 28);

      yPosition = 50;

      // Dog Name & Health Status
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text(dog.name, margin, yPosition);

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      const healthColor =
        healthPrediction === "Healthy" ? [34, 197, 94] : [234, 179, 8]; // green or yellow
      pdf.text(
        `Health Status: ${healthPrediction || "Unknown"}`,
        pageWidth - margin - 60,
        yPosition
      );

      yPosition += 12;

      // Divider
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Basic Information
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Basic Information", margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");

      const basicInfo = [
        { label: "Breed", value: dog.breed || "Unknown" },
        { label: "Age", value: `${dog.age} years` },
        { label: "Weight", value: `${dog.weight} lbs` },
        { label: "Sex", value: dog.sex.charAt(0).toUpperCase() + dog.sex.slice(1) },
        {
          label: "Activity Level",
          value:
            dog.dailyActivityLevel.charAt(0).toUpperCase() +
            dog.dailyActivityLevel.slice(1),
        },
        { label: "Daily Walk Distance", value: `${dog.dailyWalkDistance} miles` },
      ];

      basicInfo.forEach((info) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(`${info.label}:`, margin, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(info.value, margin + 55, yPosition);
        yPosition += 7;
      });

      yPosition += 5;

      // Health Information
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Health Information", margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");

      const healthInfo = [
        { label: "Heart Rate", value: `${dog.heartBeatRate} bpm` },
        { label: "Temperature", value: `${dog.averageTemperature}°F` },
        { label: "Hours of Sleep", value: `${dog.hoursOfSleep} hours/day` },
        { label: "Annual Vet Visits", value: `${dog.annualVetVisits} visits/year` },
        { label: "Seizures", value: dog.seizures ? "Yes" : "No" },
      ];

      healthInfo.forEach((info) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(`${info.label}:`, margin, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(info.value, margin + 55, yPosition);
        yPosition += 7;
      });

      yPosition += 5;

      // Diet Information
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Diet", margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      yPosition = addWrappedText(dog.diet, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 8;

      // Medications
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Medications", margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      if (dog.medications.length > 0) {
        dog.medications.forEach((med) => {
          pdf.text(`• ${med}`, margin + 5, yPosition);
          yPosition += 6;
        });
      } else {
        pdf.text("No current medications", margin, yPosition);
        yPosition += 6;
      }

      yPosition += 8;

      // Footer
      const footerY = pageHeight - 20;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, footerY - 5, pageWidth, 30, "F");
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        margin,
        footerY
      );
      pdf.text("Powered by WOOFY - Dog Health Management", margin, footerY + 5);

      // Save PDF
      pdf.save(`${dog.name}-Health-Profile.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Share Functions
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleEmailShare = () => {
    if (!dog) return;
    const subject = encodeURIComponent(`Check out ${dog.name}'s Health Profile`);
    const body = encodeURIComponent(
      `I wanted to share ${dog.name}'s health profile with you!\n\n` +
        `Name: ${dog.name}\n` +
        `Breed: ${dog.breed || "Unknown"}\n` +
        `Age: ${dog.age} years\n` +
        `Health Status: ${healthPrediction || "Unknown"}\n\n` +
        `View full profile: ${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSocialShare = (platform: string) => {
    if (!dog) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `Check out ${dog.name}'s health profile on WOOFY!`
    );

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-green-500" />
      </div>
    );
  }

  if (error || !dog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Dog not found"}
          </h1>
          <Link
            href="/dashboard"
            className="text-green-500 hover:text-green-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Fixed Background Text */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <h1 className="text-[10vw] md:text-[10vw] font-black text-lime-900/20 leading-none tracking-tighter">
          BUDDY'S BOARD
        </h1>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 sticky top-0 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share Profile"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Download PDF"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <button
                onClick={openEditModal}
                className="px-4 py-2 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-sm transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-sm transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Buddy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={profileRef} className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Dog Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-lime-200/50 rounded-sm p-8 mb-8 shadow-2xl shadow-green-500/20 border border-lime-500 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Dog Image */}
            <div className="relative w-48 h-48 rounded-sm overflow-hidden shadow-xl flex-shrink-0 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <PawPrint className="w-16 h-16 text-green-500" />
            </div>

            {/* Dog Info */}
            <div className="flex-1 text-black">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black mb-2">
                    {dog.name}
                  </h1>
                  <p className="text-xl opacity-90">Dog Profile</p>
                </div>
                <div className="text-center px-6 py-4">
                  <div className={`text-4xl font-black ${healthPrediction === "Healthy" ? "text-green-500" : "text-red-500"}`}>{healthPrediction}</div>
                  <div className="text-sm opacity-90">Health Status</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className=" p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Cake className="w-4 h-4" />
                    <span className="text-xs opacity-75">Age</span>
                  </div>
                  <div className="font-bold">{dog.age} years</div>
                </div>
                <div className=" p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Weight className="w-4 h-4" />
                    <span className="text-xs opacity-75">Weight</span>
                  </div>
                  <div className="font-bold">{dog.weight} lbs</div>
                </div>
                <div className=" p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs opacity-75">Sex</span>
                  </div>
                  <div className="font-bold capitalize">{dog.sex}</div>
                </div>
                <div className=" p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs opacity-75">Activity</span>
                  </div>
                  <div className="font-bold capitalize">
                    {dog.dailyActivityLevel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Health Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Health Information
              </h2>
              <p className="text-sm text-gray-600">
                Current health status and vital signs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 border-2 border-green-200 rounded-sm p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Heart Rate</h3>
                  <p className="text-sm text-gray-700">
                    {dog.heartBeatRate} bpm -{" "}
                    {dog.heartBeatRate > 100
                      ? "Elevated"
                      : dog.heartBeatRate > 80
                      ? "Normal"
                      : "Low"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`${
                healthPrediction === "Healthy"
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              } border-2 rounded-sm p-5`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">
                    Health Status
                  </h3>
                  <p className="text-sm text-gray-700">
                    {healthPrediction === "Healthy"
                      ? "Healthy - No issues detected"
                      : "Not Healthy - Needs attention"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 border-2 border-blue-200 rounded-sm p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Temperature</h3>
                  <p className="text-sm text-gray-700">
                    {dog.averageTemperature}°F - Normal canine temperature range
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Diet Information */}
          <div className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Diet</h3>
            </div>
            <p className="text-gray-700">{dog.diet}</p>
          </div>

          {/* Medications */}
          <div className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Pill className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Medications</h3>
              <button
                onClick={() => setShowAddMedication(true)}
                className="ml-auto p-1 hover:bg-blue-200 rounded-lg transition-colors"
                title="Add Medication"
              >
                <Plus className="w-5 h-5 text-blue-600" />
              </button>
            </div>
            {showAddMedication && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Enter medication name"
                  className="flex-1 px-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMedication()}
                />
                <button
                  onClick={handleAddMedication}
                  className="px-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors"
                >
                  +
                </button>
                <button
                  onClick={() => {
                    setShowAddMedication(false);
                    setNewMedication("");
                  }}
                  className="px-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400 transition-colors"
                >
                  X
                </button>
              </div>
            )}
            {medications.length > 0 ? (
              <div className="space-y-2">
                {medications.map((med, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {editingIndex === index ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateMedication()}
                        />
                        <button
                          onClick={handleUpdateMedication}
                          className="px-2 bg-green-500 text-white rounded-sm hover:bg-green-600 transition-colors"
                        >
                          <FileText className="w-3 h-3"/>
                        </button>
                        <button
                          onClick={() => {
                            setEditingIndex(null);
                            setEditValue("");
                          }}
                          className="px-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400 transition-colors"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-sm flex-1">
                          {med}
                        </span>
                        <button
                          onClick={() => handleEditMedication(index)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedication(index)}
                          className="p-1 hover:bg-red-200 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No current medications</p>
            )}
          </div>

          {/* Sleep Information */}
          <div className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sleep</h3>
            </div>
            <p className="text-gray-700">{dog.hoursOfSleep} hours per day</p>
          </div>

          {/* Vet Visits */}
          <div className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Vet Visits</h3>
            </div>
            <p className="text-gray-700">{dog.annualVetVisits} visits per year</p>
          </div>

          {/* Activity Level */}
          <div className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Activity</h3>
            </div>
            <p className="text-gray-700 capitalize">
              {dog.dailyActivityLevel} activity level
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {dog.dailyWalkDistance} miles daily walk
            </p>
          </div>

          {/* Special Conditions */}
          <div className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Conditions</h3>
            </div>
            {dog.seizures ? (
              <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                Seizures
              </span>
            ) : (
              <p className="text-gray-500 text-sm">No special conditions noted</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Share {dog.name}'s Profile
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Share this health profile with others
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="p-3 bg-green-100 rounded-lg">
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">
                    {copied ? "Link Copied!" : "Copy Link"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Copy profile link to clipboard
                  </p>
                </div>
              </button>

              {/* Email */}
              <button
                onClick={handleEmailShare}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-sm text-gray-600">Share via email</p>
                </div>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleSocialShare("whatsapp")}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="p-3 bg-green-100 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                  <p className="text-sm text-gray-600">Share on WhatsApp</p>
                </div>
              </button>

              {/* Social Media */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Share on Social Media
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSocialShare("twitter")}
                    className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Twitter className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      Twitter
                    </span>
                  </button>

                  <button
                    onClick={() => handleSocialShare("facebook")}
                    className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Facebook className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      Facebook
                    </span>
                  </button>

                  <button
                    onClick={() => handleSocialShare("linkedin")}
                    className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Linkedin className="w-5 h-5 text-blue-700" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      LinkedIn
                    </span>
                  </button>
                </div>
              </div>

              {/* Profile Details */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Profile Details
                </p>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">{dog.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Breed:</span>
                    <span className="font-semibold text-gray-900">
                      {dog.breed || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-semibold text-gray-900">
                      {dog.age} years
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Health Status:</span>
                    <span
                      className={`font-semibold ${
                        healthPrediction === "Healthy"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {healthPrediction || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Dog Modal */}
      {showEditModal && (
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
                  Edit Buddy Profile
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Update your dog's health information
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  reset();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit(onEditSubmit)} className="p-8">
              <div className="space-y-6">
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
                      Breed
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
                      Heart Beat Rate *
                    </label>
                    <input
                      {...register("heartBeatRate", { valueAsNumber: true })}
                      type="number"
                      className={`w-full px-4 py-2.5 border ${
                        errors.heartBeatRate
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., 80"
                    />
                    {errors.heartBeatRate && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.heartBeatRate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Activity Level *
                    </label>
                    <select
                      {...register("dailyActivityLevel")}
                      className={`w-full px-4 py-2.5 border ${
                        errors.dailyActivityLevel
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    {errors.dailyActivityLevel && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.dailyActivityLevel.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Walk Distance (miles) *
                    </label>
                    <input
                      {...register("dailyWalkDistance", {
                        valueAsNumber: true,
                      })}
                      type="number"
                      step="0.1"
                      className={`w-full px-4 py-2.5 border ${
                        errors.dailyWalkDistance
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., 2.5"
                    />
                    {errors.dailyWalkDistance && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.dailyWalkDistance.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      {...register("age", { valueAsNumber: true })}
                      type="number"
                      className={`w-full px-4 py-2.5 border ${
                        errors.age ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., 3"
                    />
                    {errors.age && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.age.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (lbs) *
                    </label>
                    <input
                      {...register("weight", { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      className={`w-full px-4 py-2.5 border ${
                        errors.weight ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., 25.5"
                    />
                    {errors.weight && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.weight.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sex *
                    </label>
                    <select
                      {...register("sex")}
                      className={`w-full px-4 py-2.5 border ${
                        errors.sex ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {errors.sex && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.sex.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diet *
                    </label>
                    <input
                      {...register("diet")}
                      type="text"
                      className={`w-full px-4 py-2.5 border ${
                        errors.diet ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., Dry kibble"
                    />
                    {errors.diet && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.diet.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hours of Sleep *
                    </label>
                    <input
                      {...register("hoursOfSleep", { valueAsNumber: true })}
                      type="number"
                      step="0.5"
                      max="24"
                      className={`w-full px-4 py-2.5 border ${
                        errors.hoursOfSleep
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., 12"
                    />
                    {errors.hoursOfSleep && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.hoursOfSleep.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Vet Visits *
                    </label>
                    <input
                      {...register("annualVetVisits", { valueAsNumber: true })}
                      type="number"
                      className={`w-full px-4 py-2.5 border ${
                        errors.annualVetVisits
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., 2"
                    />
                    {errors.annualVetVisits && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.annualVetVisits.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average Temperature (F) *
                    </label>
                    <input
                      {...register("averageTemperature", {
                        valueAsNumber: true,
                      })}
                      type="number"
                      step="0.1"
                      min="90"
                      max="110"
                      className={`w-full px-4 py-2.5 border ${
                        errors.averageTemperature
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                      placeholder="e.g., 98.6"
                    />
                    {errors.averageTemperature && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.averageTemperature.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seizures
                    </label>
                    <select
                      {...register("seizures", {
                        setValueAs: (value) => value === "true",
                      })}
                      className={`w-full px-4 py-2.5 border ${
                        errors.seizures ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    reset();
                  }}
                  className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-6 py-2 bg-lime-400/50 text-black font-semibold rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  {isUpdating ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Updating...
                    </span>
                  ) : (
                    "Update Profile"
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