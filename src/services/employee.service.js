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

  return {
    id: String(employee._id ?? employee.id),
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    department: employee.department,
    job_title: employee.job_title,
    salary: employee.salary ?? null,
    status: employee.status,
  };
}

function handleEmployeeWriteError(err) {
  if (err?.code === 11000) {
    throw createServiceError("Employee with this email already exists", 409);
  }
  if (err?.name === "ValidationError") {
    throw createServiceError(err.message, 400);
  }
  throw err;
}

export async function createEmployee(fields) {
  const existingEmployee = await employeeRepository.getEmployeeByEmail(fields.email);
  if (existingEmployee) {
    throw createServiceError("Employee with this email already exists", 409);
  }

  try {
    return safeEmployee(await employeeRepository.createEmployee(fields));
  } catch (err) {
    handleEmployeeWriteError(err);
  }
}

export async function getEmployees({ search, department, status, page, limit }) {
  const result = await employeeRepository.getEmployees(
    search,
    { department, status },
    page,
    limit,
  );
  return {
    ...result,
    employees: result.employees.map(safeEmployee),
  };
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
    handleEmployeeWriteError(err);
  }
}

export async function deleteEmployee(id) {
  const employee = await employeeRepository.deleteEmployee(id);
  if (!employee) {
    throw createServiceError("Employee not found", 404);
  }
  return safeEmployee(employee);
}