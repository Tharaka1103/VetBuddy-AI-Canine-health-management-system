"use client"

import { motion } from "framer-motion"
import { 
  Search, 
  AlertCircle, 
  Camera, 
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Navigation
} from "lucide-react"
import { useState } from "react"

export default function DiseaseIdentifyPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showVetCenters, setShowVetCenters] = useState(false)

  const mockAnalysis = {
    condition: "Skin Rash - Dermatitis",
    severity: "moderate",
    confidence: 85,
    requiresVet: true,
    symptoms: [
      "Red, inflamed skin",
      "Visible scratching marks",
      "Mild hair loss in affected area"
    ],
    recommendations: [
      "Keep the area clean and dry",
      "Prevent excessive scratching",
      "Apply prescribed topical medication",
      "Monitor for spreading"
    ],
    urgency: "Schedule appointment within 48 hours"
  }

  const vetCenters = [
    {
      name: "City Pet Hospital",
      distance: "0.8 miles",
      phone: "+1 (555) 123-4567",
      hours: "Open until 8 PM",
      rating: 4.8,
      emergency: true
    },
    {
      name: "Happy Paws Veterinary Clinic",
      distance: "1.2 miles",
      phone: "+1 (555) 234-5678",
      hours: "Open until 6 PM",
      rating: 4.6,
      emergency: false
    },
    {
      name: "24/7 Emergency Pet Care",
      distance: "2.5 miles",
      phone: "+1 (555) 345-6789",
      hours: "Open 24 hours",
      rating: 4.9,
      emergency: true
    }
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = () => {
    setAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setAnalyzing(false)
      setAnalysisResult(mockAnalysis)
      if (mockAnalysis.requiresVet) {
        setShowVetCenters(true)
      }
    }, 3000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "text-green-600 bg-green-100"
      case "moderate":
        return "text-yellow-600 bg-yellow-100"
      case "severe":
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
            Disease <span className="text-primary-500">Identifier</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload an image of your dog&apos;s condition for instant AI-powered analysis
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Image Upload */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Upload Disease Image
                </h2>
                
                {!uploadedImage ? (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        Upload clear images of rashes, wounds, or skin conditions
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded condition"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setUploadedImage(null)
                        setAnalysisResult(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Image Guidelines
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Ensure good lighting and clear focus</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Include the entire affected area</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Avoid blurry or dark images</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Multiple angles can help with accuracy</span>
                  </li>
                </ul>
              </div>

              {/* Analyze Button */}
              {uploadedImage && !analysisResult && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="w-full mt-6 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Analyze Condition
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {analysisResult && (
                <div className="space-y-6">
                  {/* Analysis Results */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Analysis Results
                    </h2>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-800">
                          {analysisResult.condition}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(analysisResult.severity)}`}>
                          {analysisResult.severity} severity
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span>Confidence: {analysisResult.confidence}%</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-2">Identified Symptoms:</h4>
                      <ul className="space-y-1">
                        {analysisResult.symptoms.map((symptom: string, idx: number) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <span className="w-2 h-2 bg-primary-400 rounded-full mr-2 mt-1.5"></span>
                            {symptom}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-2">Recommendations:</h4>
                      <ul className="space-y-2">
                        {analysisResult.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {analysisResult.requiresVet && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-yellow-800">
                              Veterinary Care Recommended
                            </h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              {analysisResult.urgency}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nearby Vet Centers */}
                  {showVetCenters && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-lg p-6"
                    >
                      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <MapPin className="h-6 w-6 mr-2 text-primary-500" />
                        Nearest Veterinary Centers
                      </h2>

                      <div className="space-y-4">
                        {vetCenters.map((center, idx) => (
                          <div
                            key={idx}
                            className="border border-gray-200 rounded-lg p-4 hover:border-primary-400 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-gray-800">
                                  {center.name}
                                </h3>
                                {center.emergency && (
                                  <span className="inline-flex items-center text-xs text-red-600 mt-1">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Emergency Services Available
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-primary-600">
                                  {center.distance}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ★ {center.rating}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Phone className="h-4 w-4 mr-2" />
                                <span>{center.phone}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{center.hours}</span>
                              </div>
                            </div>

                            <button className="mt-3 w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center">
                              <Navigation className="h-4 w-4 mr-2" />
                              Get Directions
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Information Cards */}
              {!analysisResult && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Common Conditions We Detect
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "Skin Rashes",
                        "Wounds & Cuts",
                        "Fungal Infections",
                        "Allergic Reactions",
                        "Hot Spots",
                        "Insect Bites"
                      ].map((condition, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700"
                        >
                          {condition}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      How It Works
                    </h3>
                    <ol className="space-y-3">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                          1
                        </span>
                        <span className="text-gray-700">
                          Upload a clear image of the affected area
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                          2
                        </span>
                        <span className="text-gray-700">
                          Our AI analyzes the condition instantly
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                          3
                        </span>
                        <span className="text-gray-700">
                          Get recommendations and vet referrals if needed
                        </span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}