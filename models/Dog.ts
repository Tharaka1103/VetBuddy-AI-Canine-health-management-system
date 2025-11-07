import mongoose from "mongoose"

export interface IDog extends mongoose.Document {
  ownerId: mongoose.Types.ObjectId
  name: string
  breed?: string
  heartBeatRate: number
  isHealthy: boolean
  dailyActivityLevel: string
  dailyWalkDistance: number // in miles
  age: number
  weight: number // in lbs
  sex: "male" | "female"
  diet: string
  medications: string[]
  seizures: boolean
  hoursOfSleep: number
  annualVetVisits: number
  averageTemperature: number // in F
  createdAt: Date
  updatedAt: Date
}

const DogSchema = new mongoose.Schema<IDog>(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    breed: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    heartBeatRate: {
      type: Number,
      required: true,
      min: 0,
    },
    isHealthy: {
      type: Boolean,
      required: true,
    },
    dailyActivityLevel: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
    },
    dailyWalkDistance: {
      type: Number,
      required: true,
      min: 0,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    sex: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    diet: {
      type: String,
      required: true,
      trim: true,
    },
    medications: [{
      type: String,
      trim: true,
    }],
    seizures: {
      type: Boolean,
      default: false,
    },
    hoursOfSleep: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    annualVetVisits: {
      type: Number,
      required: true,
      min: 0,
    },
    averageTemperature: {
      type: Number,
      required: true,
      min: 90,
      max: 110,
    },
  },
  {
    timestamps: true,
  }
)

const Dog = mongoose.models.Dog || mongoose.model<IDog>("Dog", DogSchema)

export { Dog }
