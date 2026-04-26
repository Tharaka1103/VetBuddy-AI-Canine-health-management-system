import mongoose, { Schema, Document, Model } from "mongoose";

/* ------------------------------------------------------------------ */
/*  TypeScript interface                                               */
/* ------------------------------------------------------------------ */
export interface IBarkHistory extends Document {
  _id: mongoose.Types.ObjectId;
  dogId: mongoose.Types.ObjectId;
  audioUrl: string;
  predictedEmotion: string;
  timestamp: Date;
}

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */
const BarkHistorySchema = new Schema<IBarkHistory>(
  {
    dogId: {
      type: Schema.Types.ObjectId,
      ref: "Canine",
      required: true,
      index: true,
    },
    audioUrl: { type: String, default: "" },
    predictedEmotion: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BarkHistory: Model<IBarkHistory> =
  mongoose.models.BarkHistory ||
  mongoose.model<IBarkHistory>("BarkHistory", BarkHistorySchema);

export default BarkHistory;
