import mongoose, { Schema, Document, Model } from "mongoose";

/* ------------------------------------------------------------------ */
/*  TypeScript interfaces                                              */
/* ------------------------------------------------------------------ */
export interface IProgressLog {
  date: Date;
  imageUrl: string;
  affectedAreaPercentage: number;
  heartRate?: number;
  temperature?: number;
  notes?: string;
}

export interface ISkinTreatment extends Document {
  _id: mongoose.Types.ObjectId;
  canineId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  diseaseName: string;
  confidence: number;
  initialSeverityLevel: "Mild" | "Moderate" | "Severe";
  initialAffectedArea: number;
  initialImageUrl: string;
  initialHeartRate?: number;
  initialTemperature?: number;
  status: "Diagnosed" | "In Treatment" | "Recovered";
  progressLogs: IProgressLog[];
  createdAt: Date;
  updatedAt: Date;
}

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */
const ProgressLogSchema = new Schema<IProgressLog>(
  {
    date: { type: Date, default: Date.now },
    imageUrl: { type: String, required: true },
    affectedAreaPercentage: { type: Number, required: true, min: 0 },
    heartRate: { type: Number, min: 0 },
    temperature: { type: Number, min: 0 },
    notes: { type: String, default: "" },
  },
  { _id: true }
);

const SkinTreatmentSchema = new Schema<ISkinTreatment>(
  {
    canineId: {
      type: Schema.Types.ObjectId,
      ref: "Canine",
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    diseaseName: { type: String, required: true, trim: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    initialSeverityLevel: {
      type: String,
      enum: ["Mild", "Moderate", "Severe"],
      required: true,
    },
    initialAffectedArea: { type: Number, required: true, min: 0 },
    initialImageUrl: { type: String, required: true },
    initialHeartRate: { type: Number, min: 0 },
    initialTemperature: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["Diagnosed", "In Treatment", "Recovered"],
      default: "Diagnosed",
    },
    progressLogs: { type: [ProgressLogSchema], default: [] },
  },
  { timestamps: true }
);

const SkinTreatment: Model<ISkinTreatment> =
  mongoose.models.SkinTreatment ||
  mongoose.model<ISkinTreatment>("SkinTreatment", SkinTreatmentSchema);

export default SkinTreatment;
