import "dotenv/config"
import mongoose from "mongoose";

export async function ConnectDb() {
  try {
    const uri = process.env.MONGOODB_URL;

    if (!uri) {
      throw new Error("MONGOODB_URL is missing");
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
}