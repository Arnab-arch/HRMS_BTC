import "dotenv/config";
import mongoose from "mongoose";
import { ConnectDb } from "../src/config/db.js";
import Employee from "./models/employee.model.js";

async function testValidation() {
  try {
    await ConnectDb();

    const employee = new Employee({
      first_name: "Test",
      last_name: "Employee",
      email: "test-validation@example.com",
      salary: -5000,
      job_title: "Developer",
    });

    await employee.validate();
    console.log("validation passsed");
  } catch (error) {
    console.error("Validation error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testValidation();
