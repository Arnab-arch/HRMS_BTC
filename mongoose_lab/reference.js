import "dotenv/config";
import { ConnectDb } from "../src/config/db.js";
import Employee from "./models/employee.models.js";
import department from "./models/department.models.js";
import mongoose from "mongoose";

async function reference_employee() {
  try {
    await ConnectDb();

    const department_create = await department.findOneAndUpdate(
      { name: "Engineering" },
      { $setOnInsert: { description: "Software development team" } },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      },
    );

    console.log("department created", department_create);

    const employee_one = await Employee.findOne({
      first_name: "Rahul",
    });

    if (!employee_one) {
      console.log("Employee not found");
      return;
    }

    employee_one.Department = department_create._id;
    await employee_one.save();

    const employee_populated = await Employee.findOne({
      first_name: "Rahul",
    }).populate("Department");

    console.log("employee", employee_populated);
  } catch (error) {
    console.error("Reference error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

reference_employee();
