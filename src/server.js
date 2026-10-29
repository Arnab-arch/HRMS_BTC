import express from "express";
import "dotenv/config"
import mongoose from "mongoose";

import { ConnectDb } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001 ; 
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.get("/", (req, res) => {
  res.send("EMPLOYEE_MANAGEMENT_API");
});
app.use(errorMiddleware);

try {
  await ConnectDb();
  app.listen(Number(PORT), () => {
    console.log(`SERVER LISTENING ON PORT:${PORT}`);
  });
} catch (err) {
  console.error("Unable to start server:", err.message);
  await mongoose.disconnect();
  process.exitCode = 1;
}

export default app ; 