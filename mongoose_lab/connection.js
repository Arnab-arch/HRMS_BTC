import "dotenv/config"
import mongoose from "mongoose";
import { ConnectDb } from "../src/config/db.js";

export async function db_start(){
  try {
    console.log("MongoDB URI loaded:", Boolean(process.env.MONGOODB_URL));
    await ConnectDb();
    console.log("connection successfull");

    await mongoose.disconnect();
    console.log("disconnected from server");
    

    
  } catch (err) {
    console.error("Unable to connect to db:", err.message);
    process.exitCode = 1;
  }
  
}

db_start();


