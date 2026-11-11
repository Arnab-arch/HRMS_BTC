import "dotenv/config";
import mongoose from "mongoose";
import { ConnectDb } from "../config/db.js";
import User from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

async function testAdmin() {
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
    let created = false;
    let admin = await User.findOne({ email })
      .select("password_hash role")
      .exec();

    if (admin && admin.role !== "admin") {
      throw new Error("The configured email already belongs to a non-admin account.");
    }

    if (!admin) {
      const password_hash = await hashPassword(password);
      admin = await User.create({
        name,
        email,
        password_hash,
        role: "admin",
      });
      created = true;
    }

    if (!(await verifyPassword(password, admin.password_hash))) {
      throw new Error("Admin account exists, but the configured password did not verify.");
    }

    console.log(
      created
        ? "Admin created and password verification passed."
        : "Existing admin found and password verification passed.",
    );
  } finally {
    await mongoose.disconnect();
  }
}

try {
  await testAdmin();
} catch (error) {
  console.error("Admin test failed:", error.message);
  process.exitCode = 1;
}
