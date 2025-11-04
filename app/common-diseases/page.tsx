"use client"

import { motion } from "framer-motion"
import { 
  Camera, 
  Send,
  Bot,
  Upload,
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export default function CommonDiseasesPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [identifiedBreed, setIdentifiedBreed] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([
    {
      role: "assistant",
      content: "Hello! I'm your AI canine health assistant. Feel free to ask me anything about your dog's health, symptoms, or general care."
    }
  ])
  const [currentMessage, setCurrentMessage] = useState("")

  const breedInfo = {
    breed: "Golden Retriever",
    origin: "Scotland",
    lifespan: "10-12 years",
    size: "Large",
    temperament: "Friendly, Intelligent, Devoted",
    commonDiseases: [
      {
        name: "Hip Dysplasia",
        prevalence: "High",
        symptoms: ["Difficulty rising", "Lameness in hind legs", "Reluctance to jump or climb"],
        prevention: "Maintain healthy weight, regular exercise, genetic screening"
      },
      {
        name: "Progressive Retinal Atrophy",
        prevalence: "Moderate",
        symptoms: ["Night blindness", "Dilated pupils", "Bumping into objects"],
        prevention: "Regular eye exams, genetic testing before breeding"
      },
      {
        name: "Subvalvular Aortic Stenosis",
        prevalence: "Moderate",
        symptoms: ["Exercise intolerance", "Fainting", "Difficulty breathing"],
        prevention: "Regular heart screenings, avoid overexertion"
      },
      {
        name: "Elbow Dysplasia",
        prevalence: "Moderate",
        symptoms: ["Front leg lameness", "Stiffness", "Swollen joints"],
        prevention: "Proper nutrition during growth, avoid excessive exercise when young"
      }
    ]
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
        // Simulate breed identification
        setTimeout(() => {
          setIdentifiedBreed(breedInfo)
        }, 2000)
      }
      reader.readAsDataURL(file)
    }
  }

  const sendMessage = () => {
    if (currentMessage.trim()) {
      setChatMessages([...chatMessages, 
        { role: "user", content: currentMessage },
        { role: "assistant", content: "I understand your concern about " + currentMessage + ". Based on the symptoms described, I recommend monitoring your dog closely and consulting with a veterinarian if symptoms persist or worsen." }
      ])
      setCurrentMessage("")
    }
  }

  const getPrevalenceColor = (prevalence: string) => {
    switch (prevalence) {
      case "Low":
        return "text-green-600 bg-green-100"
      case "Moderate":
        return "text-yellow-600 bg-yellow-100"
      case "High":
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
            Breed-Specific <span className="text-primary-500">Disease Guide</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Identify your dog&apos;s breed and learn about common health conditions
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Breed Identification */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Upload */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Camera className="h-6 w-6 mr-2 text-primary-500" />
                  Breed Identification
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
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Upload your dog&apos;s photo
                      </p>
                      <p className="text-sm text-gray-500">
                        Our AI will identify the breed and provide health information
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Image
                        src={uploadedImage}
                        alt="Uploaded dog"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      {identifiedBreed && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-95 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Identified Breed:</p>
                          <p className="text-lg font-semibold text-primary-600">
                            {identifiedBreed.breed}
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setUploadedImage(null)
                        setIdentifiedBreed(null)
                      }}
                      className="text-primary-500 hover:text-primary-600 text-sm"
                    >
                      Upload Different Image
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Breed Information */}
              {identifiedBreed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Breed Details */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Breed Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Origin</p>
                          <p className="font-semibold text-gray-800">{identifiedBreed.origin}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Average Lifespan</p>
                          <p className="font-semibold text-gray-800">{identifiedBreed.lifespan}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Size Category</p>
                          <p className="font-semibold text-gray-800">{identifiedBreed.size}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Temperament</p>
                        <div className="flex flex-wrap gap-2">
                          {identifiedBreed.temperament.split(", ").map((trait: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Common Diseases */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Common Health Conditions
                    </h3>
                    <div className="space-y-4">
                      {identifiedBreed.commonDiseases.map((disease: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="border border-gray-200 rounded-lg p-4 hover:border-primary-400 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-gray-800">{disease.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPrevalenceColor(disease.prevalence)}`}>
                              {disease.prevalence} Risk
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Symptoms:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {disease.symptoms.map((symptom: string, sIdx: number) => (
                                  <li key={sIdx} className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-1.5"></span>
                                    {symptom}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Prevention:</p>
                              <p className="text-sm text-gray-600">{disease.prevention}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - AI Chat */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:sticky lg:top-24"
            >
              <div className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-t-xl">
                  <div className="flex items-center">
                    <Bot className="h-8 w-8 mr-3" />
                    <div>
                      <h3 className="font-semibold">AI Health Assistant</h3>
                      <p className="text-sm text-primary-100">Ask me about canine health</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Ask about symptoms, care, or health..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => setCurrentMessage("What are common symptoms of hip dysplasia?")}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                    >
                      Hip dysplasia symptoms
                    </button>
                    <button
                      onClick={() => setCurrentMessage("How to prevent joint problems?")}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                    >
                      Joint care
                    </button>
                    <button
                      onClick={() => setCurrentMessage("Best diet for senior dogs?")}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                    >
                      Senior diet
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}