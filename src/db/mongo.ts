import mongoose from "mongoose";

const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb://admin:admin@localhost:27017/life_track?authSource=admin";

export async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
