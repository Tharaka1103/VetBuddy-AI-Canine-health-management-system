"use client"

import { motion } from "framer-motion"
import { 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  FileImage,
  File,
} from "lucide-react"
import { useState } from "react"

export default function ReportAnalysisPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const extractedData = {
    reportDate: "2024-01-15",
    petName: "Max",
    age: "5 years",
    overallHealth: "moderate",
    criticalFindings: [
      {
        parameter: "Blood Glucose",
        value: "180 mg/dL",
        normalRange: "70-110 mg/dL",
        status: "high",
        severity: "moderate"
      },
      {
        parameter: "ALT (Liver Enzyme)",
        value: "85 U/L",
        normalRange: "10-70 U/L",
        status: "elevated",
        severity: "mild"
      }
    ],
    normalFindings: [
      {
        parameter: "Heart Rate",
        value: "95 bpm",
        normalRange: "70-120 bpm",
        status: "normal"
      },
      {
        parameter: "Temperature",
        value: "101.5°F",
        normalRange: "100-102.5°F",
        status: "normal"
      }
    ],
    recommendations: [
      "Monitor blood glucose levels closely",
      "Consider dietary adjustments for blood sugar management",
      "Follow-up liver function test in 3 months",
      "Maintain regular exercise routine"
    ],
    nextCheckup: "3 months"
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setAnalysisComplete(false)
    }
  }

  const analyzeReport = () => {
    setAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setAnalyzing(false)
      setAnalysisComplete(true)
    }, 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600 bg-green-100"
      case "elevated":
      case "mild":
        return "text-yellow-600 bg-yellow-100"
      case "high":
      case "moderate":
        return "text-orange-600 bg-orange-100"
      case "critical":
      case "severe":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getHealthScoreColor = (score: string) => {
    switch (score) {
      case "excellent":
        return "from-green-400 to-green-600"
      case "good":
        return "from-blue-400 to-blue-600"
      case "moderate":
        return "from-yellow-400 to-yellow-600"
      case "poor":
        return "from-red-400 to-red-600"
      default:
        return "from-gray-400 to-gray-600"
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
            Medical Report <span className="text-primary-500">Analysis</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your pet&apos;s medical reports for instant health insights and criticality assessment
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Upload Section */}
          {!analysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Upload Medical Report
              </h2>

              {!uploadedFile ? (
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-400 transition-colors cursor-pointer">
                    <div className="flex justify-center mb-4">
                      <FileImage className="h-12 w-12 text-gray-400 mr-2" />
                      <File className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-2">
                      Drop your medical report here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, JPG, PNG formats (Max 10MB)
                    </p>
                  </div>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-primary-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <button
                    onClick={analyzeReport}
                    disabled={analyzing}
                    className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing Report...
                      </>
                    ) : (
                      <>
                        <Activity className="h-5 w-5 mr-2" />
                        Analyze Report
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Analysis Results */}
          {analysisComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Health Score Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Overall Health Assessment
                  </h2>
                  <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${getHealthScoreColor(extractedData.overallHealth)} flex items-center justify-center text-white mb-4`}>
                    <div className="text-center">
                      <p className="text-3xl font-bold">75%</p>
                      <p className="text-sm">Health Score</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(extractedData.overallHealth)}`}>
                    {extractedData.overallHealth.toUpperCase()} CONDITION
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Pet Name</p>
                    <p className="font-semibold text-gray-800">{extractedData.petName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Report Date</p>
                    <p className="font-semibold text-gray-800">{extractedData.reportDate}</p>
                  </div>
                </div>
              </div>

              {/* Critical Findings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-2 text-orange-500" />
                  Critical Findings
                </h3>
                <div className="space-y-4">
                  {extractedData.criticalFindings.map((finding, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border border-orange-200 rounded-lg p-4 bg-orange-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800">{finding.parameter}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Current Value</p>
                          <p className="font-semibold text-orange-600 flex items-center">
                            {finding.value}
                            {finding.status === "high" ? (
                              <TrendingUp className="h-4 w-4 ml-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 ml-1" />
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Normal Range</p>
                          <p className="font-semibold text-gray-800">{finding.normalRange}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Normal Findings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                  Normal Parameters
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {extractedData.normalFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="bg-green-50 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-gray-800 mb-2">{finding.parameter}</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Value: {finding.value}</span>
                        <span className="text-green-600 font-medium">✓ Normal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Veterinary Recommendations
                </h3>
                <ul className="space-y-3">
                  {extractedData.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">Next Recommended Checkup</p>
                  <p className="font-semibold text-primary-600">{extractedData.nextCheckup}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium flex items-center justify-center">
                  <Download className="h-5 w-5 mr-2" />
                  Download Analysis Report
                </button>
                <button
                  onClick={() => {
                    setUploadedFile(null)
                    setAnalysisComplete(false)
                  }}
                  className="flex-1 bg-secondary-400 text-gray-900 py-3 rounded-lg hover:bg-secondary-300 transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Another Report
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}