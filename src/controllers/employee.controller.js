import * as employeeService from "../services/employee.service.js";

export async function createEmployee(req, res, next) {
  try {
    const employee = await employeeService.createEmployee(req.validatedBody);
    return res.status(201).json({ employee });
  } catch (err) {
    return next(err);
  }
}

export async function getEmployees(req, res, next) {
  try {
    const result = await employeeService.getEmployees(req.validatedQuery);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function getEmployeeById(req, res, next) {
  try {
    const employee = await employeeService.getEmployeeById(req.validatedParams.id);
    return res.status(200).json({ employee });
  } catch (err) {
    return next(err);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const employee = await employeeService.updateEmployee(
      req.validatedParams.id,
      req.validatedBody,
    );
    return res.status(200).json({ employee });
  } catch (err) {
    return next(err);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const employee = await employeeService.deleteEmployee(req.validatedParams.id);
    return res.status(200).json({ employee });
  } catch (err) {
    return next(err);
  }
}