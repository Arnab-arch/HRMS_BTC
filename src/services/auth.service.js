import {
  getUserByEmail,
  getUserById,
  createUser,
} from "../repositories/user.repository.js";

import { generateToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : email;
}

function toSafeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function isDuplicateEmailError(err) {
  return err?.code === 11000;
}

export async function registerUser({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createServiceError("User with this email already exists", 409);
  }

  const password_hash = await hashPassword(password);

  try {
    const newUser = await createUser(name, normalizedEmail, password_hash, "user");

    return {
      message: "User created successfully",
      user: toSafeUser(newUser),
    };
  } catch (err) {
    if (isDuplicateEmailError(err)) {
      throw createServiceError("User with this email already exists", 409);
    }

    throw err;
  }
}


export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    throw createServiceError("Invalid email or password", 401);
  }

  const passwordCheck = await verifyPassword(password, user.password_hash);

  if (!passwordCheck) {
    throw createServiceError("Invalid email or password", 401);
  }

  const token = generateToken(user);

  return {
    user: toSafeUser(user),
    token,
    message: "Login successful",
  };
}

export async function getUserDetailsById(id) {
  const user = await getUserById(id);

  if (!user) {
    throw createServiceError("User not found", 404);
  }

  return toSafeUser(user);
}

export async function createUserAsAdmin({ name, email, password, role }) {
  if (!["admin", "user"].includes(role)) {
    throw createServiceError("Invalid user role", 400);
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createServiceError("User with this email already exists", 409);
  }

  const password_hash = await hashPassword(password);

  try {
    const newUser = await createUser(name, normalizedEmail, password_hash, role);

    return {
      message: "User created successfully",
      user: toSafeUser(newUser),
    };
  } catch (err) {
    if (isDuplicateEmailError(err)) {
      throw createServiceError("User with this email already exists", 409);
    }

    throw err;
  }
}

export async function createAdminAsAdmin({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);
  return createUserAsAdmin({ name, email: normalizedEmail, password, role: "admin" });
}

export async function getCurrentUser(userId) {
  const user = await getUserById(userId);

  if (!user) {
    throw createServiceError("User not found", 404);
  }

  return toSafeUser(user);
}
