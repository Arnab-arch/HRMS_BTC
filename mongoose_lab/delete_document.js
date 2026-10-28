import mongoose from "mongoose";
import { ConnectDb } from "../src/config/db.js";
import Employee from "./models/employee.models.js";

async function Delete_employeeOne(){
  try{
    await ConnectDb();
    const result = await Employee.deleteOne(condition , [options]  , callback  ) ;
    console.log("employee data :" , result);
    
    
  }catch(error){
    console.error("Error fetching employees" , error.message);
    
  }finally{
    await mongoose.disconnect();
  }
}

Update_employeeOne();
