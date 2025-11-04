"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Dog, 
  Stethoscope, 
  FileText, 
  Apple, 
  BookOpen,
  Calendar,
  Activity,
  Bell,
  Settings
} from "lucide-react"

export default function DashboardPage() {
  const quickStats = [
    { label: "Total Canines", value: "3", icon: Dog, color: "bg-primary-100 text-primary-600" },
    { label: "Health Checks", value: "12", icon: Activity, color: "bg-secondary-100 text-secondary-600" },
    { label: "Reports", value: "8", icon: FileText, color: "bg-blue-100 text-blue-600" },
    { label: "Appointments", value: "2", icon: Calendar, color: "bg-purple-100 text-purple-600" }
  ]

  const features = [
    {
      title: "Disease Identifier",
      description: "Check symptoms and identify potential health issues",
      icon: Stethoscope,
      href: "/disease-identify",
      color: "from-red-400 to-red-600"
    },
    {
      title: "Report Master",
      description: "Generate and manage health reports",
      icon: FileText,
      href: "/report-master",
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "Nutrition Buddy",
      description: "Create personalized diet plans",
      icon: Apple,
      href: "/nutrition-buddy",
      color: "from-green-400 to-green-600"
    },
    {
      title: "Common Diseases",
      description: "Learn about canine health conditions",
      icon: BookOpen,
      href: "/common-diseases",
      color: "from-purple-400 to-purple-600"
    }
  ]

  const recentActivities = [
    { type: "health_check", message: "Health check completed for Max", time: "2 hours ago" },
    { type: "report", message: "Monthly report generated", time: "1 day ago" },
    { type: "nutrition", message: "Diet plan updated for Bella", time: "3 days ago" },
    { type: "appointment", message: "Vet appointment scheduled", time: "5 days ago" }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, <span className="text-primary-500">John!</span>
          </h1>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your canines today</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-lg ${stat.color} mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Features Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <Link
                    key={index}
                    href={feature.href}
                    className="group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 h-full"
                    >
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white mb-4`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary-500 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* My Canines Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">My Canines</h2>
                <Link
                  href="/canines"
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Dog Name {i}</h3>
                        <p className="text-sm text-gray-600">Breed • Age years</p>
                      </div>
                    </div>
                    <Link
                      href={`/canines/${i}`}
                      className="text-primary-500 hover:text-primary-600"
                    >
                      View Profile →
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link
                  href="/settings"
                  className="flex items-center space-x-3 text-gray-600 hover:text-primary-500 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center space-x-3 text-gray-600 hover:text-primary-500 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </Link>
                <Link
                  href="/help"
                  className="flex items-center space-x-3 text-gray-600 hover:text-primary-500 transition-colors"
                >
                  <Activity className="h-5 w-5" />
                  <span>Help Center</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}