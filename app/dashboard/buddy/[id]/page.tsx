"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

interface Dog {
  _id: string;
  name: string;
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
  export default function BuddyProfilePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dogId = params.id as string;

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
    } catch (err: any) {
      setError(err.message || "Failed to load dog data");
    } finally {
      setLoading(false);
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
      <div className="relative z-10  bg-white/80 sticky top-0 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-gray-700" />
              </button>
              <button className="px-4 py-2 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-sm transition-colors flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
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
                <div className="text-4xl font-black">{dog.isHealthy ? "95" : "75"}</div>
                <div className="text-sm opacity-90">Health Score</div>
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
              <div className="font-bold capitalize">{dog.dailyActivityLevel}</div>
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
              <h2 className="text-2xl font-bold text-gray-900">Health Information</h2>
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
                  <h3 className="font-bold text-gray-900 mb-1">
                    Heart Rate
                  </h3>
                  <p className="text-sm text-gray-700">
                    {dog.heartBeatRate} bpm - {dog.heartBeatRate > 100 ? 'Elevated' : dog.heartBeatRate > 80 ? 'Normal' : 'Low'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`${dog.isHealthy ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border-2 rounded-sm p-5`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">
                    Health Status
                  </h3>
                  <p className="text-sm text-gray-700">
                    {dog.isHealthy ? 'Healthy - No issues detected' : 'Needs attention - Monitor closely'}
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
                  <h3 className="font-bold text-gray-900 mb-1">
                    Temperature
                  </h3>
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
            </div>
            {dog.medications.length > 0 ? (
              <div className="space-y-2">
                {dog.medications.map((med, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-1 mb-1">
                    {med}
                  </span>
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
            <p className="text-gray-700 capitalize">{dog.dailyActivityLevel} activity level</p>
            <p className="text-sm text-gray-600 mt-1">{dog.dailyWalkDistance} miles daily walk</p>
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
    </div>
  );
}