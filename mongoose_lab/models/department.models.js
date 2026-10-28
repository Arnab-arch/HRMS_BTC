import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
});

const department = mongoose.model("department", departmentSchema);

export default department;
