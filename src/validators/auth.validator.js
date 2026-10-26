import {z} from "zod";

export const emailSchema = z
  .string()
  .trim()
  .max(200)
  .email("enter a valid email address")
  .transform((email) => email.toLowerCase());
export const passwordSchema = z.string().min(12,"password must contain 12 characters").max(40 , "password must not exceed 40 characters")
export const registerSchema = z.object({
  name:z.string().trim().min(2,"name must contain at least 2 characters").max(100 , "name must not exceed 100 characters"),
  email:emailSchema,
  password:passwordSchema,
}).strict()

export const loginSchema = z.object({
  email:emailSchema,
  password:passwordSchema,
}).strict()

export const adminSchema = z.object({
  name:z.string().trim().min(2,"name must contain at least 2 characters").max(100 , "name must not exceed 100 characters"),
  email:emailSchema,
  password:passwordSchema,
  role:z.enum(["admin" , "user"], "role must be either admin or user"),
}).strict()

export const createAdminSchema = z.object({
  name:z.string().trim().min(2,"name must contain at least 2 characters").max(100 , "name must not exceed 100 characters"),
  email:emailSchema,
  password:passwordSchema,
}).strict()