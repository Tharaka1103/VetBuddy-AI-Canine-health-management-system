import mongoose, { Schema, Document, Model } from "mongoose";

/* ------------------------------------------------------------------ */
/*  TypeScript interface                                               */
/* ------------------------------------------------------------------ */
export interface ICareCenter extends Document {
  _id: mongoose.Types.ObjectId;
  Center_Name: string;
  Location: string;
  Location_Coords: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  Facility_Type:
    | "Specialized Hospital"
    | "General Vet Clinic"
    | "Government Vet Office";
  Is_24x7: boolean;
  Specializations: string;
  Average_Rating: number;
  Current_Wait_Time_Mins: number;
  Contact_Number: string;
}

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */
const CareCenterSchema = new Schema<ICareCenter>(
  {
    Center_Name: { type: String, required: true, trim: true },
    Location: { type: String, required: true, trim: true },
    Location_Coords: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    Facility_Type: {
      type: String,
      enum: [
        "Specialized Hospital",
        "General Vet Clinic",
        "Government Vet Office",
      ],
      required: true,
    },
    Is_24x7: { type: Boolean, default: false },
    Specializations: { type: String, default: "" },
    Average_Rating: { type: Number, default: 0, min: 0, max: 5 },
    Current_Wait_Time_Mins: { type: Number, default: 0, min: 0 },
    Contact_Number: { type: String, default: "" },
  },
  { timestamps: true }
);

/* 2dsphere index for geospatial queries */
CareCenterSchema.index({ Location_Coords: "2dsphere" });

const CareCenter: Model<ICareCenter> =
  mongoose.models.CareCenter ||
  mongoose.model<ICareCenter>("CareCenter", CareCenterSchema);

export default CareCenter;
