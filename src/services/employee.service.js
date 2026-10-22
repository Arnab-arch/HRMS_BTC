import * as employeeRepository from "../repositories/employee.repository.js";

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function safeEmployee(employee) {
  if (!employee) {
    return null;
  }
  const { id, first_name, last_name, email, department, job_title, salary, status } =
    employee;
  return {
    id,
    first_name,
    last_name,
    email,
    department,
    job_title,
    salary,
    status,
  };
}

export async function createEmployee(fields) {
  const existingEmployee = await employeeRepository.getEmployeeByEmail(fields.email);
  if (existingEmployee) {
    throw createServiceError("Employee with this email already exists", 409);
  }

  try {
    return safeEmployee(await employeeRepository.createEmployee(fields));
  } catch (err) {
    if (err.code === "23505") {
      throw createServiceError("Employee with this email already exists", 409);
    }
    throw err;
  }
}

export async function getEmployees({ search, department, status, page, limit }) {
  return employeeRepository.getEmployees(
    search,
    { department, status },
    page,
    limit,
  );
}

export async function getEmployeeById(id) {
  const employee = await employeeRepository.getEmployeeById(id);
  if (!employee) {
    throw createServiceError("Employee not found", 404);
  }
  return safeEmployee(employee);
}

export async function updateEmployee(id, fields) {
  const employee = await employeeRepository.getEmployeeById(id);
  if (!employee) {
    throw createServiceError("Employee not found", 404);
  }

  if (fields.email && fields.email !== employee.email) {
    const existingEmployee = await employeeRepository.getEmployeeByEmail(fields.email);
    if (existingEmployee) {
      throw createServiceError("Employee with this email already exists", 409);
    }
  }

  try {
    const updatedEmployee = await employeeRepository.updateEmployee(id, fields);
    return safeEmployee(updatedEmployee);
  } catch (err) {
    if (err.code === "23505") {
      throw createServiceError("Employee with this email already exists", 409);
    }
    throw err;
  }
}

export async function deleteEmployee(id) {
  const employee = await employeeRepository.deleteEmployee(id);
  if (!employee) {
    throw createServiceError("Employee not found", 404);
  }
  return safeEmployee(employee);
}