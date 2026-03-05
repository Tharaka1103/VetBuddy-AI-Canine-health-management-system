import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

/* ------------------------------------------------------------------ */
/*  TypeScript interfaces                                              */
/* ------------------------------------------------------------------ */
export interface INotificationSettings {
  emailAlerts: boolean;
  anomalyAlerts: boolean;
  weeklyReport: boolean;
  pushNotifications: boolean;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  phone: string;
  authProvider: "local" | "google" | "facebook" | "apple";
  authProviderId: string;
  avatar: string;
  notificationSettings: INotificationSettings;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    phone: { type: String, default: "" },
    authProvider: {
      type: String,
      enum: ["local", "google", "facebook", "apple"],
      default: "local",
    },
    authProviderId: { type: String, default: "" },
    avatar: { type: String, default: "" },
    notificationSettings: {
      emailAlerts: { type: Boolean, default: true },
      anomalyAlerts: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

/* Hash password before save */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/* Instance method – compare hashed passwords */
UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

/* Prevent model recompilation during HMR — delete stale cached model */
if (mongoose.models.User) {
  delete (mongoose.models as any).User;
}
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
