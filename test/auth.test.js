import test from "node:test";
import assert from "node:assert/strict";
import {
  adminSchema,
  loginSchema,
  registerSchema,
} from "../src/validators/auth.validator.js";

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