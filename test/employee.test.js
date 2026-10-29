import test from "node:test";
import assert from "node:assert/strict";
import {
  createEmployeeSchema,
  employeeIdSchema,
  listEmployeesSchema,
  updateEmployeeSchema,
} from "../src/validators/employee.validator.js";
import Employee from "../src/models/employee.model.js";

test("employee creation validates required fields and normalizes email", () => {
  const result = createEmployeeSchema.safeParse({
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ADA@example.com",
    department: "Research",
    job_title: "Analyst",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.email, "ada@example.com");
  assert.equal(result.data.status, "active");
  assert.equal(
    createEmployeeSchema.safeParse({
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      department: "Research",
      job_title: "Analyst",
      status: "unknown",
    }).success,
    false,
  );
  assert.equal(
    createEmployeeSchema.safeParse({
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      department: "Research",
      job_title: "Analyst",
      status: "on_leave",
    }).success,
    true,
  );
});

test("employee filters and identifiers enforce valid pagination and IDs", () => {
  assert.equal(
    listEmployeesSchema.safeParse({
      search: "  Ada ",
      page: "2",
      limit: "50",
      status: "active",
    }).success,
    true,
  );
  assert.equal(listEmployeesSchema.safeParse({ page: "0" }).success, false);
  assert.equal(listEmployeesSchema.safeParse({ limit: "101" }).success, false);
  assert.equal(employeeIdSchema.safeParse({ id: "507f1f77bcf86cd799439011" }).success, true);
  assert.equal(employeeIdSchema.safeParse({ id: "4" }).success, false);
});

test("employee updates reject empty and unknown fields", () => {
  assert.equal(updateEmployeeSchema.safeParse({}).success, false);
  assert.equal(updateEmployeeSchema.safeParse({ first_name: "Ada" }).success, true);
  assert.equal(updateEmployeeSchema.safeParse({ role: "admin" }).success, false);
});

test("employee model allows omitted salary and applies MongoDB defaults", async () => {
  const employee = new Employee({
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    department: "Research",
    job_title: "Analyst",
  });

  await employee.validate();
  assert.equal(employee.status, "active");
  assert.equal(employee.salary, undefined);
  const invalidSalary = new Employee({
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    department: "Research",
    job_title: "Analyst",
    salary: -1,
  });
  await assert.rejects(invalidSalary.validate(), { name: "ValidationError" });
  assert.deepEqual(
    Employee.schema.indexes().map(([index, options]) => ({
      email: index.email,
      unique: options.unique,
    })),
    [{ email: 1, unique: true }],
  );
});