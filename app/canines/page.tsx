"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, Dog, Calendar, Heart, Edit, Trash2 } from "lucide-react"
import { useState } from "react"

export default function CaninesPage() {
  const [canines] = useState([
    {
      id: 1,
      name: "Max",
      breed: "Golden Retriever",
      age: 5,
      weight: "30 kg",
      lastCheckup: "2024-01-15",
      healthStatus: "Excellent",
      image: "/api/placeholder/200/200"
    },
    {
      id: 2,
      name: "Bella",
      breed: "German Shepherd",
      age: 3,
      weight: "25 kg",
      lastCheckup: "2024-01-20",
      healthStatus: "Good",
      image: "/api/placeholder/200/200"
    },
    {
      id: 3,
      name: "Charlie",
      breed: "Labrador",
      age: 7,
      weight: "32 kg",
      lastCheckup: "2024-01-10",
      healthStatus: "Needs Attention",
      image: "/api/placeholder/200/200"
    }
  ])

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "text-green-600 bg-green-100"
      case "Good":
        return "text-blue-600 bg-blue-100"
      case "Needs Attention":
        return "text-yellow-600 bg-yellow-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Canines</h1>
              <p className="text-gray-600">Manage and monitor your furry friends</p>
            </div>
            <button className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors">
              <Plus className="h-5 w-5" />
              <span>Add New Canine</span>
            </button>
          </div>
        </motion.div>

        {/* Canines Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canines.map((canine, index) => (
            <motion.div
              key={canine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Image Section */}
              <div className="relative h-48 bg-gradient-to-br from-primary-400 to-secondary-400">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dog className="h-24 w-24 text-white opacity-50" />
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{canine.name}</h3>
                    <p className="text-gray-600">{canine.breed}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(canine.healthStatus)}`}>
                    {canine.healthStatus}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Age: {canine.age} years</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="h-4 w-4 mr-2" />
                    <span>Weight: {canine.weight}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Last Checkup: {new Date(canine.lastCheckup).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/canines/${canine.id}`}
                    className="flex-1 text-center bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    View Details
                  </Link>
                  <button className="p-2 text-gray-600 hover:text-primary-500 transition-colors">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add New Canine Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <Link
            href="/canines/new"
            className="block bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-dashed border-gray-300 hover:border-primary-400"
          >
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-primary-100 text-primary-500 mb-4">
                <Plus className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Add New Canine</h3>
              <p className="text-gray-600">Register a new furry friend to start tracking their health</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}