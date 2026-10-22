import * as authService from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });
    return res.status(201).json({ ...result, message: "User registered successfully" });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return res.status(200).json({ message: "Login successful", ...result });
  } catch (err) {
    return next(err);
  }
}
export async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await authService.getCurrentUser(userId);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const result = await authService.createUserAsAdmin(req.body);
    return res.status(201).json({ message: "User created successfully", ...result });
  } catch (err) {
    return next(err);
  }
}