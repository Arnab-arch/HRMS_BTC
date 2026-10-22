import test from "node:test";
import assert from "node:assert/strict";
import {
  createEmployeeSchema,
  employeeIdSchema,
  listEmployeesSchema,
  updateEmployeeSchema,
} from "../src/validators/employee.validator.js";

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
  assert.equal(employeeIdSchema.safeParse({ id: "4" }).success, true);
  assert.equal(employeeIdSchema.safeParse({ id: "-1" }).success, false);
});

test("employee updates reject empty and unknown fields", () => {
  assert.equal(updateEmployeeSchema.safeParse({}).success, false);
  assert.equal(updateEmployeeSchema.safeParse({ first_name: "Ada" }).success, true);
  assert.equal(updateEmployeeSchema.safeParse({ role: "admin" }).success, false);
});