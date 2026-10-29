import test from "node:test";
import assert from "node:assert/strict";
import {
  adminSchema,
  createAdminSchema,
  loginSchema,
  registerSchema,
} from "../src/validators/auth.validator.js";
import { getUserById } from "../src/repositories/user.repository.js";

test("public registration accepts only user fields and normalizes email", () => {
  const result = registerSchema.safeParse({
    name: "Ada Lovelace",
    email: "ADA@example.com",
    password: "long-enough-password",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.email, "ada@example.com");
  assert.equal(
    registerSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "long-enough-password",
      role: "admin",
    }).success,
    false,
  );
});

test("login and admin account schemas enforce their request fields", () => {
  assert.equal(
    loginSchema.safeParse({
      email: "ada@example.com",
      password: "long-enough-password",
    }).success,
    true,
  );
  assert.equal(
    adminSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "long-enough-password",
      role: "admin",
    }).success,
    true,
  );
  assert.equal(
    adminSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "long-enough-password",
      role: "owner",
    }).success,
    false,
  );
});

test("admin creation schema validates credentials without accepting a client role", () => {
  const validAdmin = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "long-enough-password",
  };

  assert.equal(createAdminSchema.safeParse(validAdmin).success, true);
  assert.equal(
    createAdminSchema.safeParse({ ...validAdmin, role: "user" }).success,
    false,
  );
  assert.equal(
    createAdminSchema.safeParse({ ...validAdmin, password: "short" }).success,
    false,
  );
});

test("user lookup rejects invalid MongoDB IDs without querying the database", async () => {
  assert.equal(await getUserById("not-an-object-id"), null);
});