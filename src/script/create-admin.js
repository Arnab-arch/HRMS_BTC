import "dotenv/config";
import mongoose from "mongoose";
import { ConnectDb } from "../config/db.js";
import { hashPassword } from "../utils/password.js";
import Employee from "../models/employee.model.js";
import User from "../models/user.model.js";

async function testModels() {
  console.log("\n--- Model checks ---");

  console.log("Employee model:", Employee.modelName);
  console.log("User model:", User.modelName);

  const employee = new Employee({
    first_name: "Rahul",
    last_name: "Kumar",
    email: "rahul.test@example.com",
    department: "Engineering",
    job_title: "Backend Developer",
    salary: 45000,
  });

  await employee.validate();
  console.log("Employee validation: PASSED");
  console.log("Default employee status:", employee.status);

  const user = new User({
    name: "Test Admin",
    email: "admin.test@example.com",
    password_hash: "test-hash",
    role: "admin",
  });

  await user.validate();
  console.log("User validation: PASSED");

  const invalidEmployee = new Employee({
    first_name: "Test",
    last_name: "User",
    email: "invalid.test@example.com",
    department: "Engineering",
    job_title: "Developer",
    salary: -100,
    status: "unknown",
  });

  try {
    await invalidEmployee.validate();
    throw new Error("Invalid employee unexpectedly passed validation");
  } catch (error) {
    if (error.name !== "ValidationError") {
      throw error;
    }

    console.log("Invalid employee validation: REJECTED");
    console.log("Validation errors:", Object.keys(error.errors));
  }

  console.log("\n--- Index definitions ---");
  console.log("Employee indexes:", Employee.schema.indexes());
  console.log("User indexes:", User.schema.indexes());
}

async function main_admin() {
  const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error("Admin credentials are missing.");
  }
  if (password.length < 12 || password.length > 40) {
    throw new Error("Admin password must be between 12 and 40 characters.");
  }

  await ConnectDb();

  try {
    await testModels();

    const existingAdmin = await User.findOne({ email })
      .select("email role")
      .exec();

    if (existingAdmin) {
      if (existingAdmin.role === "admin") {
        console.log("Admin user already exists:", existingAdmin.email);
        return;
      }

      throw new Error("This email already belongs to a non-admin account.");
    }

    const password_hash = await hashPassword(password);
    const admin = await User.create({
      name,
      email,
      password_hash,
      role: "admin",
    });

    console.log("Admin user created successfully:", {
      id: String(admin._id),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } finally {
    await mongoose.disconnect();
  }
}

try {
  await main_admin();
} catch (error) {
  console.error("Error creating admin user:", error.message);
  process.exitCode = 1;
}
