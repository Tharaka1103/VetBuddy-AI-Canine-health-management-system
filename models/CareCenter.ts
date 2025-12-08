import mongoose from "mongoose"

export interface ICareCenter extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  name: string
  type: "house" | "care-center" | "vet-clinic" | "pet-grooming"
  description: string
  ownerName: string
  ownerPhone: string
  location: {
    address: string
    city: string
    zipCode: string
    latitude: number
    longitude: number
  }
  images: {
    url: string // Google Drive file ID or public URL
    driveFileId: string // Google Drive file ID for management
    uploadedAt: Date
  }[]
  operatingHours: {
    open: string // HH:mm format
    close: string // HH:mm format
  }
  capacity: number
  availableBeds: number
  services: string[]
  medicines: string[]
  isVerified: boolean
  rating: number // Average rating
  reviews: { rating: number; comment: string; author: string; date: Date }[]
  createdAt: Date
  updatedAt: Date
}

const CareCenterSchema = new mongoose.Schema<ICareCenter>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["house", "care-center", "vet-clinic", "pet-grooming"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        driveFileId: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    operatingHours: {
      open: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
      close: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    availableBeds: {
      type: Number,
      required: true,
      min: 0,
    },
    services: {
      type: [String],
      default: [],
    },
    medicines: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        author: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const CareCenter =
  mongoose.models.CareCenter ||
  mongoose.model<ICareCenter>("CareCenter", CareCenterSchema)

export { CareCenter }
