"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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

// Mock data for individual dog
const dogData = {
  "1": {
    id: "1",
    name: "Max",
    breed: "Golden Retriever",
    age: "3 years 4 months",
    birthday: "July 15, 2021",
    weight: "32 kg",
    gender: "Male",
    color: "Golden",
    microchipId: "985112345678901",
    image: "/roy.jpg",
    healthScore: 95,
    owner: {
      name: "John Doe",
      phone: "+1 234 567 8900",
      email: "john@example.com",
    },
    vet: {
      name: "Dr. Sarah Johnson",
      clinic: "Happy Paws Veterinary Clinic",
      phone: "+1 234 567 8901",
      address: "123 Pet Street, Dogville, DG 12345",
    },
    vaccinations: [
      {
        name: "Rabies",
        date: "Dec 15, 2023",
        nextDue: "Dec 15, 2024",
        status: "due-soon",
      },
      {
        name: "DHPP",
        date: "Oct 10, 2024",
        nextDue: "Oct 10, 2025",
        status: "current",
      },
      {
        name: "Bordetella",
        date: "Sep 5, 2024",
        nextDue: "Sep 5, 2025",
        status: "current",
      },
      {
        name: "Leptospirosis",
        date: "Aug 20, 2024",
        nextDue: "Aug 20, 2025",
        status: "current",
      },
    ],
    medications: [
      {
        name: "Heartgard Plus",
        dosage: "1 tablet",
        frequency: "Monthly",
        startDate: "Jan 1, 2024",
        active: true,
      },
      {
        name: "NexGard",
        dosage: "1 chewable",
        frequency: "Monthly",
        startDate: "Jan 1, 2024",
        active: true,
      },
    ],
    checkups: [
      {
        date: "Nov 1, 2024",
        vet: "Dr. Sarah Johnson",
        reason: "Annual Checkup",
        notes: "Healthy, no issues found. Continue current diet and exercise.",
        weight: "32 kg",
      },
      {
        date: "Aug 15, 2024",
        vet: "Dr. Sarah Johnson",
        reason: "Dental Cleaning",
        notes: "Teeth cleaned, minor tartar buildup removed.",
        weight: "31.5 kg",
      },
      {
        date: "May 10, 2024",
        vet: "Dr. Michael Chen",
        reason: "Ear Infection",
        notes: "Prescribed antibiotics for 10 days. Follow-up needed.",
        weight: "31 kg",
      },
    ],
    weightHistory: [
      { date: "Nov 2024", weight: 32 },
      { date: "Oct 2024", weight: 31.8 },
      { date: "Sep 2024", weight: 31.5 },
      { date: "Aug 2024", weight: 31.5 },
      { date: "Jul 2024", weight: 31.2 },
      { date: "Jun 2024", weight: 31 },
    ],
    allergies: ["Chicken", "Dairy products"],
    specialNotes:
      "Loves swimming! Afraid of thunderstorms. Needs joint supplements for hip health.",
    aiInsights: [
      {
        type: "positive",
        title: "Excellent Health Trend",
        description:
          "Max's weight is stable and within healthy range for his breed and age.",
      },
      {
        type: "warning",
        title: "Vaccination Due Soon",
        description:
          "Rabies vaccination is due in 10 days. Schedule an appointment with your vet.",
      },
      {
        type: "info",
        title: "Activity Recommendation",
        description:
          "Based on Max's breed and age, recommend 60-90 minutes of exercise daily.",
      },
    ],
  },
};

export default function BuddyProfilePage() {
  const params = useParams();
  const dogId = params.id as string;
  const dog = dogData[dogId as keyof typeof dogData];

  if (!dog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dog not found
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

  const getVaccinationStatus = (status: string) => {
    if (status === "current")
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          Current
        </span>
      );
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
        Due Soon
      </span>
    );
  };

  const getInsightIcon = (type: string) => {
    if (type === "positive")
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (type === "warning")
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <Brain className="w-5 h-5 text-blue-500" />;
  };

  const getInsightBg = (type: string) => {
    if (type === "positive") return "bg-green-50 border-green-200";
    if (type === "warning") return "bg-yellow-50 border-yellow-200";
    return "bg-blue-50 border-blue-200";
  };

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
            <div className="relative w-48 h-48 rounded-sm overflow-hidden shadow-xl flex-shrink-0">
              <Image
                src={dog.image}
                alt={dog.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Dog Info */}
            <div className="flex-1 text-black">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black mb-2">
                    {dog.name}
                  </h1>
                  <p className="text-xl opacity-90">{dog.breed}</p>
                </div>
                <div className="text-center  px-6 py-4">
                  <div className="text-4xl font-black">{dog.healthScore}</div>
                  <div className="text-sm opacity-90">Health Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className=" p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Cake className="w-4 h-4" />
                    <span className="text-xs opacity-75">Age</span>
                  </div>
                  <div className="font-bold">{dog.age}</div>
                </div>
                <div className=" p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Weight className="w-4 h-4" />
                    <span className="text-xs opacity-75">Weight</span>
                  </div>
                  <div className="font-bold">{dog.weight}</div>
                </div>
                <div className=" p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs opacity-75">Gender</span>
                  </div>
                  <div className="font-bold">{dog.gender}</div>
                </div>
                <div className=" p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4" />
                    <span className="text-xs opacity-75">Color</span>
                  </div>
                  <div className="font-bold">{dog.color}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
              <p className="text-sm text-gray-600">
                Personalized health recommendations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dog.aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`${getInsightBg(
                  insight.type
                )} border-2 rounded-sm p-5`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-700">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vaccinations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
               
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Vaccinations
                  </h2>
                  <p className="text-sm text-gray-600">
                    Immunization records and schedules
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {dog.vaccinations.map((vaccine, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">
                          {vaccine.name}
                        </h3>
                        {getVaccinationStatus(vaccine.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Last: {vaccine.date}</span>
                        <span>•</span>
                        <span>Next: {vaccine.nextDue}</span>
                      </div>
                    </div>
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Medications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Current Medications
                  </h2>
                  <p className="text-sm text-gray-600">
                    Active treatments and preventatives
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {dog.medications.map((med, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        {med.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4" />
                          <span>Dosage: {med.dosage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Frequency: {med.frequency}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Started: {med.startDate}</span>
                        </div>
                      </div>
                    </div>
                    {med.active && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Checkup History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Checkup History
                  </h2>
                  <p className="text-sm text-gray-600">
                    Past veterinary visits and notes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {dog.checkups.map((checkup, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {checkup.reason}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {checkup.date} • {checkup.vet}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {checkup.weight}
                        </div>
                        <div className="text-xs text-gray-500">Weight</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                      {checkup.notes}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Vaccines Current
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">3</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Due Soon
                    </span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">1</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Total Checkups
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {dog.checkups.length}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Veterinarian Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Veterinarian
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Stethoscope className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Doctor
                    </span>
                  </div>
                  <p className="text-gray-900 font-semibold ml-6">
                    {dog.vet.name}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Clinic
                    </span>
                  </div>
                  <p className="text-gray-900 font-semibold ml-6">
                    {dog.vet.clinic}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Phone
                    </span>
                  </div>
                  <p className="text-gray-900 font-semibold ml-6">
                    {dog.vet.phone}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Address
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    {dog.vet.address}
                  </p>
                </div>
              <button className="px-4 py-2 bg-lime-400/50 hover:bg-lime-500 text-black font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 w-full">
                  Schedule Appointment
                </button>
              </div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Additional Info
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Allergies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {dog.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Microchip ID
                  </h4>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded border border-gray-200">
                    {dog.microchipId}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Special Notes
                  </h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                    {dog.specialNotes}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Weight Trend */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-lime-50/70 border-2 border-lime-400 rounded-sm backdrop-blur-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="text-xl font-bold text-gray-900">
                  Weight Trend
                </h3>
              </div>
              <div className="space-y-2">
                {dog.weightHistory.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">{record.date}</span>
                    <span className="font-semibold text-gray-900">
                      {record.weight} kg
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}