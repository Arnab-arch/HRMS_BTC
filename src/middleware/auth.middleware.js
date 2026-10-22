import { verifyToken } from "../utils/jwt.js";
import { getUserById } from "../repositories/user.repository.js";

export async function Authmiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.slice("Bearer ".length);
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!decoded || typeof decoded !== "object" || typeof decoded.sub !== "string") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await getUserById(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin privileges are required",
    });
  }

  next();
}