import mongoose from "mongoose"

export interface IUser extends mongoose.Document {
  name: string
  email: string
  password: string
  role: "user" | "admin" | "doctor"
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "doctor"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
)

// Check if the model already exists to prevent re-compilation
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export { User }
