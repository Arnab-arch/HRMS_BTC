
import {
  getUserByEmail,
  getUserById,
  createUser,
} from "../repositories/user.repository.js";

import { generateToken } from "../utils/jwt.js";
import {
  hashPassword,
  verifyPassword,
} from "../utils/password.js";

function createServiceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function registerUser({ name, email, password }) {
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw createServiceError("User with this email already exists", 409);
  }

  const password_hash = await hashPassword(password);

  try {
    const newUser = await createUser(name, email, password_hash, "user");
    const safeUser = {
      id: String(newUser.id),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return {
      message: "User created successfully",
      user: safeUser,
    };
  } catch (err) {
    if (err.code === "23505") {
      throw createServiceError("User with this email already exists", 409);
    }

    throw err;
  }
}


export async function loginUser({ email, password }) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw createServiceError("Invalid email or password", 401);
  }

  const passwordCheck = await verifyPassword(
    password,
    user.password_hash
  );

  if (!passwordCheck) {
    throw createServiceError("Invalid email or password", 401);
  }

  const token = generateToken(user);

  const safeUser = {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return {
    user: safeUser,
    token,
    message: "Login successful",
  };
}

export async function getUserDetailsById(id) {
  const user = await getUserById(id);

  if (!user) {
    throw createServiceError("User not found", 404);
  }

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function createUserAsAdmin({
  name,
  email,
  password,
  role,
}) {
  if (!["admin", "user"].includes(role)) {
    throw createServiceError("Invalid user role", 400);
  }

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw createServiceError("User with this email already exists", 409);
  }

  const password_hash = await hashPassword(password);

  try {
    const newUser = await createUser(name, email, password_hash, role);

    return {
      message: "User created successfully",
      user: newUser,
    };
  } catch (err) {
    if (err.code === "23505") {
      throw createServiceError("User with this email already exists", 409);
    }

    throw err;
  }
}
export async function getCurrentUser(userId) {
  const user = await getUserById(userId);

  if (!user) {
    throw createServiceError("User not found", 404);
  }

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}