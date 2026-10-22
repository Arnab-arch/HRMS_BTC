import { Router } from "express";
import * as employeeController from "../controllers/employee.controller.js";
import { Authmiddleware, requireAdmin } from "../middleware/auth.middleware.js";
import {
  createEmployeeSchema,
  employeeIdSchema,
  listEmployeesSchema,
  updateEmployeeSchema,
} from "../validators/employee.validator.js";

const router = Router();

function validate(schema, source, target) {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    req[target] = result.data;
    return next();
  };
}

router.use(Authmiddleware);
router.post(
  "/",
  requireAdmin,
  validate(createEmployeeSchema, "body", "validatedBody"),
  employeeController.createEmployee,
);
router.get(
  "/",
  validate(listEmployeesSchema, "query", "validatedQuery"),
  employeeController.getEmployees,
);
router.get(
  "/:id",
  validate(employeeIdSchema, "params", "validatedParams"),
  employeeController.getEmployeeById,
);
router.patch(
  "/:id",
  requireAdmin,
  validate(employeeIdSchema, "params", "validatedParams"),
  validate(updateEmployeeSchema, "body", "validatedBody"),
  employeeController.updateEmployee,
);
router.delete(
  "/:id",
  requireAdmin,
  validate(employeeIdSchema, "params", "validatedParams"),
  employeeController.deleteEmployee,
);

export default router;