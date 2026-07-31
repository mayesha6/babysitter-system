import { z } from "zod";
import { Role, Status } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  email: z
    .string()
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
  phone: z
    .string()
    .min(5, { message: "Phone number must be at least 5 characters long." })
    .max(20, { message: "Phone number cannot exceed 20 characters." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
  role: z.enum(Object.values(Role) as [string, ...string[]]),
});

export const updateUserZodSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }).max(50, { message: "Name cannot exceed 50 characters." }).optional(),
  phone: z.string().min(5).max(20).optional(),
  role: z.enum(Object.values(Role) as [string, ...string[]]).optional(),
  status: z.enum(Object.values(Status) as [string, ...string[]]).optional(),
  isDeleted: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
});
