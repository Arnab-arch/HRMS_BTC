
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },

    last_name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    job_title: {
      type: String,
      required: true,
      trim: true,
    },

    salary: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "on_leave"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
