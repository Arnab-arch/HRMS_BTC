
import "dotenv/config";
import mongoose from "mongoose";
import { ConnectDb } from "../src/config/db.js";
import Employee from "./models/employee.models.js";

async function search_employees() {
  try {
    await ConnectDb();

    const search = "Ra";
    const page = 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
      ],
    };

    const result = await Employee.find(filter)
      .sort({ first_name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    console.log({
      data: result,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Error searching employees:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

search_employees();
