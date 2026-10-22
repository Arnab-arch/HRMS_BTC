
import pool from "../config/db.js";
import { hashPassword } from "../utils/password.js";
import "dotenv/config";

async function main_admin() {
  const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL
    ?.trim()
    .toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error("Admin credentials are missing.");
  }
  if (password.length < 12 || password.length > 40) {
    throw new Error("Admin password must be between 12 and 40 characters.");
  }

  const existingAdmin = await pool.query(
    "SELECT id, name, email, role FROM users WHERE email = $1",
    [email]
  );

  if (existingAdmin.rows.length > 0) {
    if (existingAdmin.rows[0].role === "admin") {
      console.log("Admin user already exists:", existingAdmin.rows[0].email);
      return;
    }

    throw new Error(
      "This email already belongs to a non-admin account."
    );
  }

  const password_hash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
    [name, email, password_hash, "admin"]
  );

  console.log("Admin user created successfully:", result.rows[0]);
}

try {
  await main_admin();
} catch (err) {
  console.error("Error creating admin user:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
