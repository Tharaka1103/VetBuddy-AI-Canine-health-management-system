import mongoose, { Schema, Document, Model } from "mongoose";

/* ------------------------------------------------------------------ */
/*  TypeScript interface                                               */
/* ------------------------------------------------------------------ */
export interface ICanine extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  name: string;
  breedSize: "Small" | "Medium" | "Large";
  age: number;
  image: string;
  createdAt: Date;
}

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */
const CanineSchema = new Schema<ICanine>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    breedSize: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      required: true,
    },
    age: { type: Number, required: true, min: 0 },
    image: {
      type: String,
      default: "/placeholder-dog.png",
    },
  },
  { timestamps: true }
);

const Canine: Model<ICanine> =
  mongoose.models.Canine || mongoose.model<ICanine>("Canine", CanineSchema);

export default Canine;
