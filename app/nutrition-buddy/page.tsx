"use client"

import { motion } from "framer-motion"
import { 
  Apple, 
  Calculator, 
  Heart, 
  Activity,
  Pill,
  CheckCircle,
  Clock,
  Target
} from "lucide-react"
import { useState } from "react"

export default function NutritionBuddyPage() {
  const [formData, setFormData] = useState({
    dogName: "",
    age: "",
    weight: "",
    breed: "",
    activityLevel: "moderate",
    playTimeHours: "",
    vetVisitsPerYear: "",
    currentMedications: "",
    healthConditions: ""
  })
  const [showPrediction, setShowPrediction] = useState(false)

  const healthPrediction = {
    overallScore: 82,
    lifeExpectancy: "12-14 years",
    riskFactors: [
      { factor: "Obesity Risk", level: "low", score: 20 },
      { factor: "Joint Problems", level: "moderate", score: 45 },
      { factor: "Heart Disease", level: "low", score: 15 },
      { factor: "Diabetes Risk", level: "low", score: 25 }
    ],
    nutritionRecommendations: {
      dailyCalories: 1200,
      proteinPercentage: 25,
      fatPercentage: 15,
      carbPercentage: 60,
      supplements: ["Glucosamine", "Omega-3", "Probiotics"]
    },
    exerciseRecommendations: {
      dailyWalkMinutes: 60,
      playTimeMinutes: 30,
      activities: ["Swimming", "Fetch", "Agility Training"]
    },
    preventiveCare: [
      "Maintain healthy weight",
      "Regular joint supplements",
      "Bi-annual health checkups",
      "Dental care routine"
    ]
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const generatePrediction = (e: React.FormEvent) => {
    e.preventDefault()
    setShowPrediction(true)
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-100"
      case "moderate":
        return "text-yellow-600 bg-yellow-100"
      case "high":
        return "text-red-600 bg-red-100"
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
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            AI-Powered Nutrition & Health <span className="text-primary-500">Predictor</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized health predictions and nutrition plans based on your dog&apos;s lifestyle
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {!showPrediction ? (
            /* Input Form */
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onSubmit={generatePrediction}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Enter Your Dog&apos;s Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-primary-500" />
                    Basic Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dog&apos;s Name
                    </label>
                    <input
                      type="text"
                      name="dogName"
                      value={formData.dogName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age (years)
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Breed
                    </label>
                    <input
                      type="text"
                      name="breed"
                      value={formData.breed}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Activity & Health */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary-500" />
                    Activity & Health
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Activity Level
                    </label>
                    <select
                      name="activityLevel"
                      value={formData.activityLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="low">Low (Mostly indoor)</option>
                      <option value="moderate">Moderate (Regular walks)</option>
                      <option value="high">High (Very active)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Play Time (hours)
                    </label>
                    <input
                      type="number"
                      name="playTimeHours"
                      value={formData.playTimeHours}
                      onChange={handleInputChange}
                      step="0.5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Vet Visits
                    </label>
                    <input
                      type="number"
                      name="vetVisitsPerYear"
                      value={formData.vetVisitsPerYear}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Medical Information */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="font-medium text-gray-700 flex items-center">
                    <Pill className="h-5 w-5 mr-2 text-primary-500" />
                    Medical Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Medications (if any)
                    </label>
                    <textarea
                      name="currentMedications"
                      value={formData.currentMedications}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="List any medications your dog is currently taking..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Known Health Conditions
                    </label>
                    <textarea
                      name="healthConditions"
                      value={formData.healthConditions}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="List any diagnosed health conditions..."
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium flex items-center justify-center"
              >
                <Calculator className="h-5 w-5 mr-2" />
                Generate Health Prediction
              </button>
            </motion.form>
          ) : (
            /* Prediction Results */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Health Score Overview */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Health Prediction for {formData.dogName}
                  </h2>
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full"></div>
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{healthPrediction.overallScore}</p>
                        <p className="text-sm text-gray-600">Health Score</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700">
                    Expected Lifespan: <span className="font-semibold text-primary-600">{healthPrediction.lifeExpectancy}</span>
                  </p>
                </div>

                {/* Risk Factors */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Health Risk Assessment
                  </h3>
                  <div className="space-y-3">
                    {healthPrediction.riskFactors.map((risk, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-700">{risk.factor}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                risk.level === "low" ? "bg-green-500" :
                                risk.level === "moderate" ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${risk.score}%` }}
                            ></div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(risk.level)}`}>
                            {risk.level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nutrition Recommendations */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Apple className="h-6 w-6 mr-2 text-primary-500" />
                    Nutrition Plan
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Daily Calorie Requirement</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {healthPrediction.nutritionRecommendations.dailyCalories} kcal
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Protein</span>
                        <span className="font-semibold">{healthPrediction.nutritionRecommendations.proteinPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Fat</span>
                        <span className="font-semibold">{healthPrediction.nutritionRecommendations.fatPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Carbohydrates</span>
                        <span className="font-semibold">{healthPrediction.nutritionRecommendations.carbPercentage}%</span>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-800 mb-2">Recommended Supplements</p>
                      <div className="flex flex-wrap gap-2">
                        {healthPrediction.nutritionRecommendations.supplements.map((supplement, idx) => (
                          <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                            {supplement}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercise Recommendations */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Activity className="h-6 w-6 mr-2 text-primary-500" />
                    Exercise Plan
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Daily Walk</p>
                        <p className="text-xl font-bold text-blue-600">
                          {healthPrediction.exerciseRecommendations.dailyWalkMinutes} min
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Play Time</p>
                        <p className="text-xl font-bold text-green-600">
                          {healthPrediction.exerciseRecommendations.playTimeMinutes} min
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-800 mb-2">Recommended Activities</p>
                      <ul className="space-y-2">
                        {healthPrediction.exerciseRecommendations.activities.map((activity, idx) => (
                          <li key={idx} className="flex items-center text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preventive Care */}
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Preventive Care Recommendations
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {healthPrediction.preventiveCare.map((care, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{care}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium">
                  Save Nutrition Plan
                </button>
                <button
                  onClick={() => setShowPrediction(false)}
                  className="flex-1 bg-secondary-400 text-gray-900 py-3 rounded-lg hover:bg-secondary-300 transition-colors duration-200 font-medium"
                >
                  Calculate for Another Dog
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}