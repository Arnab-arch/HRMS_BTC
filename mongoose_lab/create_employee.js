import "dotenv/config";
import Employee from "../mongoose_lab/models/employee.models.js";
import { ConnectDb } from "../src/config/db.js";
import mongoose from "mongoose";

async function create_employee() {
  try {
    await ConnectDb();
    const employee = new Employee({
      first_name: "Rahul",
      last_name: "Sharma",
      salary: 45000,
      job_title: "Backend Developer",
      email: "rahul@example.com",
    });

    await employee.save();
    console.log("employee created:", employee);
  } catch (err) {
    console.error("error creating employee , ", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Connection to mongoose disconnected");
  }
}

create_employee();
