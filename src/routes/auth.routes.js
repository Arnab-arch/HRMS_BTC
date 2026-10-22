import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import * as authValidator from "../validators/auth.validator.js";
import { Authmiddleware, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    req.body = result.data;
    return next();
  };
}

router.post(
  "/register",
  validateBody(authValidator.registerSchema),
  authController.register,
);
router.post(
  "/login",
  validateBody(authValidator.loginSchema),
  authController.login,
);
router.get("/CurrentUser", Authmiddleware, authController.getCurrentUser);
router.post(
  "/createUser",
  Authmiddleware,
  requireAdmin,
  validateBody(authValidator.adminSchema),
  authController.createUser,
);
export default router;
