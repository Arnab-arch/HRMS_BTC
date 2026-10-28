import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema({
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

  salary: {
    type: Number,
    required: true,
    min: 0,
  },

  status: {
    type: String,
    default: "active",
  },

  job_title: {
    type: String,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  Department: {
    type: Schema.Types.ObjectId,
    ref: "department",
  },
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
