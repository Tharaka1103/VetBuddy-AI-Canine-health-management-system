/**
 * Seed script — populates the database with demo data.
 * Run with: npx tsx lib/seed.ts
 */
import mongoose from "mongoose";
import { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

/* ------------------------------------------------------------------ */
/*  TypeScript interface                                               */
/* ------------------------------------------------------------------ */
export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  canineId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "Alert" | "Info" | "Warning";
  isRead: boolean;
  createdAt: Date;
}

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */
const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    canineId: {
      type: Schema.Types.ObjectId,
      ref: "Canine",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["Alert", "Info", "Warning"],
      default: "Info",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);


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


/* ------------------------------------------------------------------ */
/*  TypeScript interface                                               */
/* ------------------------------------------------------------------ */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
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
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

/* Hash password before save */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/* Instance method – compare hashed passwords */
UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

/* Prevent model recompilation during HMR */
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);


const MONGODB_URI = "mongodb+srv://woofy:1234@cluster0.8h1a36q.mongodb.net/Woofy?appName=Cluster0";

// Global cache to prevent multiple connections in dev (HMR)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB with connection caching.
 * Safe to call multiple times — returns existing connection if available.
 */
export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

async function seed() {
  await connectDB();
  console.log("🔗 Connected to MongoDB");

  /* ---- Clear existing data ---- */
  await Promise.all([
    User.deleteMany({}),
    Canine.deleteMany({}),
    HealthRecord.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing collections");

  /* ---- Users ---- */
  const admin = await User.create({
    name: "Admin User",
    email: "admin@woofy.com",
    password: "admin123",
    role: "admin",
  });

  const user1 = await User.create({
    name: "John Doe",
    email: "user1@woofy.com",
    password: "user1234",
    role: "user",
  });

  const user2 = await User.create({
    name: "Jane Smith",
    email: "user2@woofy.com",
    password: "user1234",
    role: "user",
  });

  console.log("👤 Created users");

  /* ---- Canines ---- */
  const dog1 = await Canine.create({
    ownerId: user1._id,
    name: "Max",
    breedSize: "Large",
    age: 4,
    image: "/placeholder-dog.png",
  });

  const dog2 = await Canine.create({
    ownerId: user1._id,
    name: "Bella",
    breedSize: "Small",
    age: 2,
    image: "/placeholder-dog.png",
  });

  const dog3 = await Canine.create({
    ownerId: user2._id,
    name: "Rocky",
    breedSize: "Medium",
    age: 5,
    image: "/placeholder-dog.png",
  });

  console.log("🐕 Created canines");

  /* ---- Health Records ---- */
  const now = Date.now();
  const records = [
    // Max – healthy records
    { canineId: dog1._id, ambientTemp: 28, dogTemp: 38.5, heartRate: 80, activityLevel: "Resting" as const, aiDiagnosis: "Healthy", aiReason: "", userFeedback: "Correct" as const, timestamp: new Date(now - 6 * 3600_000) },
    { canineId: dog1._id, ambientTemp: 30, dogTemp: 38.8, heartRate: 95, activityLevel: "Walking" as const, aiDiagnosis: "Healthy", aiReason: "", userFeedback: "Correct" as const, timestamp: new Date(now - 5 * 3600_000) },
    { canineId: dog1._id, ambientTemp: 32, dogTemp: 39.7, heartRate: 130, activityLevel: "Resting" as const, aiDiagnosis: "Anomaly", aiReason: "High Temperature Detected: Maybe Fever or Heat Stroke 🌡️", userFeedback: "Correct" as const, timestamp: new Date(now - 4 * 3600_000) },
    { canineId: dog1._id, ambientTemp: 27, dogTemp: 38.3, heartRate: 75, activityLevel: "Resting" as const, aiDiagnosis: "Healthy", aiReason: "", userFeedback: "Pending" as const, timestamp: new Date(now - 3 * 3600_000) },
    // Bella – healthy
    { canineId: dog2._id, ambientTemp: 25, dogTemp: 38.2, heartRate: 90, activityLevel: "Walking" as const, aiDiagnosis: "Healthy", aiReason: "", userFeedback: "Correct" as const, timestamp: new Date(now - 2 * 3600_000) },
    // Rocky – anomaly
    { canineId: dog3._id, ambientTemp: 34, dogTemp: 40.1, heartRate: 140, activityLevel: "Running" as const, aiDiagnosis: "Anomaly", aiReason: "High Temperature Detected: Maybe Fever or Heat Stroke 🌡️", userFeedback: "Pending" as const, timestamp: new Date(now - 1 * 3600_000) },
  ];

  await HealthRecord.insertMany(records);
  console.log("📊 Created health records");

  /* ---- Notifications ---- */
  await Notification.insertMany([
    {
      userId: user1._id,
      canineId: dog1._id,
      title: "Anomaly Detected",
      message: "High Temperature detected for Max. Please observe carefully.",
      type: "Alert",
      isRead: false,
    },
    {
      userId: user2._id,
      canineId: dog3._id,
      title: "Anomaly Detected",
      message: "High Temperature detected for Rocky. Please observe carefully.",
      type: "Alert",
      isRead: false,
    },
    {
      userId: user1._id,
      canineId: dog2._id,
      title: "Check-up Reminder",
      message: "Bella is due for her regular health check.",
      type: "Info",
      isRead: true,
    },
  ]);
  console.log("🔔 Created notifications");

  console.log("\n✅ Seed complete!");
  console.log("  Admin  → admin@woofy.com / admin123");
  console.log("  User 1 → john@woofy.com  / user1234");
  console.log("  User 2 → jane@woofy.com  / user1234");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
