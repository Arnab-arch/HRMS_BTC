import mongoose from "mongoose";
import { ConnectDb } from "../src/config/db.js";
import Employee from "./models/employee.models.js";

async function User_index() {
  try {
    await ConnectDb();
    const result = await Employee.listIndexes();
    console.log(result);

    const employee = await Employee.create({
      first_name: "Index",
      last_name: "TestOne",
      email: "mongoose-index-test@example.com",
      salary: 30000,
      job_title: "Developer",
    });
    console.log("employee created", employee);

    try {
      const employee = await Employee.create({
        first_name: "Index",
        last_name: "TestOne",
        email: "mongoose-index-test@example.com",
        salary: 30000,
        job_title: "Developer",
      });
      console.log("employee created", employee);
    } catch (error) {
      console.error("Error fetching employees ID", error.message);
    }
  } catch (error) {
    console.error("Error fetching employees ID", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

User_index();
