import { z } from "zod";
import { emailSchema } from "./auth.validator.js";

const employeeStatusSchema = z.enum(["active", "inactive", "on_leave"]);

export const employeeIdSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "id must be a valid MongoDB ObjectId"),
});

export const createEmployeeSchema = z
  .object({
    first_name: z.string().trim().min(1).max(100),
    last_name: z.string().trim().min(1).max(100),
    email: emailSchema,
    department: z.string().trim().min(1).max(100),
    job_title: z.string().trim().min(1).max(100),
    salary: z.coerce.number().finite().nonnegative().optional(),
    status: employeeStatusSchema.default("active"),
  })
  .strict();

export const updateEmployeeSchema = z
  .object({
    first_name: z.string().trim().min(1).max(100).optional(),
    last_name: z.string().trim().min(1).max(100).optional(),
    email: emailSchema.optional(),
    department: z.string().trim().min(1).max(100).optional(),
    job_title: z.string().trim().min(1).max(100).optional(),
    salary: z.coerce.number().finite().nonnegative().optional(),
    status: employeeStatusSchema.optional(),
  })
  .strict()
  .refine((fields) => Object.keys(fields).length > 0, {
    message: "At least one employee field must be provided",
  });

export const listEmployeesSchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    department: z.string().trim().min(1).max(100).optional(),
    status: employeeStatusSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  })
  .strict();