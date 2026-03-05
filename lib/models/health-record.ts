import mongoose, { Schema, Document, Model } from "mongoose";

/* ------------------------------------------------------------------ */
/*  TypeScript interface                                               */
/* ------------------------------------------------------------------ */
export interface IHealthRecord extends Document {
  _id: mongoose.Types.ObjectId;
  canineId: mongoose.Types.ObjectId;
  ambientTemp: number;
  dogTemp: number;
  heartRate: number;
  activityLevel: "Resting" | "Walking" | "Running";
  aiDiagnosis: string;
  aiReason: string;
  userFeedback: "Pending" | "Correct" | "Incorrect";
  timestamp: Date;
}

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */
const HealthRecordSchema = new Schema<IHealthRecord>({
  canineId: {
    type: Schema.Types.ObjectId,
    ref: "Canine",
    required: true,
    index: true,
  },
  ambientTemp: { type: Number, required: true },
  dogTemp: { type: Number, required: true },
  heartRate: { type: Number, required: true },
  activityLevel: {
    type: String,
    enum: ["Resting", "Walking", "Running"],
    required: true,
  },
  aiDiagnosis: { type: String, default: "" },
  aiReason: { type: String, default: "" },
  userFeedback: {
    type: String,
    enum: ["Pending", "Correct", "Incorrect"],
    default: "Pending",
  },
  timestamp: { type: Date, default: Date.now },
});

const HealthRecord: Model<IHealthRecord> =
  mongoose.models.HealthRecord ||
  mongoose.model<IHealthRecord>("HealthRecord", HealthRecordSchema);

export default HealthRecord;
