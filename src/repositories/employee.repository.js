import mongoose from "mongoose";
import Employee from "../models/employee.model.js";

export async function getEmployeeByEmail(email) {
  return Employee.findOne({ email }).exec();
}

export async function createEmployee({
  first_name,
  last_name,
  email,
  department,
  job_title,
  salary,
  status,
}) {
  return Employee.create({
    first_name,
    last_name,
    email,
    department,
    job_title,
    salary: salary ?? null,
    status,
  });
}

export async function getAllEmployees() {
  return Employee.find().sort({ _id: 1 }).exec();
}

export async function getEmployeeById(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  return Employee.findById(id).exec();
}

export async function updateEmployee(id, fields) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  return Employee.findByIdAndUpdate(id, fields, {
    new: true,
    runValidators: true,
  }).exec();
}

export async function deleteEmployee(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  return Employee.findByIdAndDelete(id).exec();
}

export async function getEmployees(search, filters = {}, page = 1, limit = 10) {
  const query = {};

  if (search !== undefined && search !== "") {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escapedSearch, "i");
    query.$or = [
      { first_name: searchRegex },
      { last_name: searchRegex },
      { email: searchRegex },
      { job_title: searchRegex },
    ];
  }

  for (const [key, value] of Object.entries(filters)) {
    if (
      ["department", "status"].includes(key) &&
      value !== undefined &&
      value !== ""
    ) {
      query[key] = value;
    }
  }

  const offset = (page - 1) * limit;
  const [employees, total] = await Promise.all([
    Employee.find(query).sort({ _id: 1 }).skip(offset).limit(limit).exec(),
    Employee.countDocuments(query).exec(),
  ]);

  return {
    employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
