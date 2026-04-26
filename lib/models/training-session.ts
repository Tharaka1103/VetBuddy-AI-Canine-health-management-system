import mongoose, { Schema, Document, Model } from "mongoose";

/* ------------------------------------------------------------------ */
/*  TypeScript interface                                               */
/* ------------------------------------------------------------------ */
export interface ITrainingSession extends Document {
  _id: mongoose.Types.ObjectId;
  dogId: mongoose.Types.ObjectId;
  commandGiven: string;
  language: "en" | "si";
  headPosture: string;
  bodyPosture: string;
  atomicBehavior: string;
  isSuccessful: boolean;
  timestamp: Date;
}

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */
const TrainingSessionSchema = new Schema<ITrainingSession>(
  {
    dogId: {
      type: Schema.Types.ObjectId,
      ref: "Canine",
      required: true,
      index: true,
    },
    commandGiven: { type: String, required: true, trim: true },
    language: {
      type: String,
      enum: ["en", "si"],
      default: "en",
    },
    headPosture: { type: String, default: "" },
    bodyPosture: { type: String, default: "" },
    atomicBehavior: { type: String, default: "" },
    isSuccessful: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const TrainingSession: Model<ITrainingSession> =
  mongoose.models.TrainingSession ||
  mongoose.model<ITrainingSession>("TrainingSession", TrainingSessionSchema);

export default TrainingSession;
