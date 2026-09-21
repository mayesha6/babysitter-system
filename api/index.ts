import app from "../src/app";
import mongoose from "mongoose";
import { envVars } from "../src/app/config/env";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  if (mongoose.connections[0] && mongoose.connections[0].readyState) {
    isConnected = true;
    return;
  }
  if (envVars.DB_URL) {
    await mongoose.connect(envVars.DB_URL);
    isConnected = true;
  }
};

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err: any) {
    console.error("Vercel DB Connection Error:", err);
  }
  return app(req, res);
}

