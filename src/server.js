import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";

import { ConnectDb } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS policy does not allow this origin"));
    },
    credentials: true,
  }),
);

const PORT = process.env.PORT || 5001;
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
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

export default app;
