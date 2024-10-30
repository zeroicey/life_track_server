import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/life_track";

export async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
