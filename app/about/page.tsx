"use client"

import { motion } from "framer-motion"
import { Heart, Users, Award, Clock } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We care deeply about every dog's health and happiness"
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a supportive network of dog owners and experts"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to providing the best health management tools"
    },
    {
      icon: Clock,
      title: "Innovation",
      description: "Continuously improving with cutting-edge technology"
    }
  ]

  return (
    <div className="py-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              About <span className="text-primary-500">PawHealth</span>
            </h1>
            <p className="text-xl text-gray-600">
              Dedicated to revolutionizing canine healthcare through technology and compassion
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                At PawHealth, we believe every dog deserves access to the best healthcare possible. 
                Our mission is to empower dog owners with the tools and knowledge they need to ensure 
                their furry companions live long, healthy, and happy lives.
              </p>
              <p className="text-gray-600">
                Through innovative technology and expert guidance, we&apos;re making canine healthcare 
                more accessible, affordable, and effective than ever before.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-primary-100 rounded-xl p-8"
            >
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Our Impact</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <span className="text-primary-500 mr-2">✓</span>
                    10,000+ dogs monitored daily
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-primary-500 mr-2">✓</span>
                    500+ diseases identified early
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-primary-500 mr-2">✓</span>
                    98% user satisfaction rate
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-primary-500 mr-2">✓</span>
                    24/7 expert support available
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do at PawHealth
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="inline-flex p-3 rounded-full bg-primary-100 text-primary-500 mb-4">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to canine health
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  Team Member {i}
                </h3>
                <p className="text-gray-600">Position Title</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}