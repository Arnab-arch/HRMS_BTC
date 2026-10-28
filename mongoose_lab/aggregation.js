import "dotenv/config";
import mongoose from "mongoose";
import { ConnectDb } from "../src/config/db.js";
import Employee from "./models/employee.models.js";

async function employee_aggregation() {
  try {
    await ConnectDb();
    const employee_aggregate = await Employee.aggregate([
      { $match: { email: { $exists: true } } },
      { $group: { _id: "$job_title", count: { $sum: 1 } } },
    ]);

    console.log(employee_aggregate);
  } catch (error) {
    console.error("Aggregation error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

employee_aggregation();
