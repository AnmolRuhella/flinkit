import { z } from "zod";
import { PUBLIC_ROLES } from "../models/user.model.js";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(PUBLIC_ROLES, {
    errorMap: () => ({
      message: "Role must be CUSTOMER, SELLER, or AGENT",
    }),
  }),
  phone: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
