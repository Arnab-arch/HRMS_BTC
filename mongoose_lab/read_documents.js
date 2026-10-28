import mongoose from "mongoose";
import { ConnectDb } from "../src/config/db.js";
import Employee from "./models/employee.models.js";

async function FindAllEmployee(){
  try{
    await ConnectDb();
    const result = await Employee.find({salary:{$gt:40000}}) ;
    console.log("employee data :" , result);
    
  }catch(error){
    console.error("Error fetching employees" , error.message);
    
  }finally{
    await mongoose.disconnect();
  }
}

FindAllEmployee();