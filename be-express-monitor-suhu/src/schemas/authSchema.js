import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["admin", "user"], "role tidak valid").default("user"),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});


export const updateUserSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  role: z.enum(["admin", "user"], { 
    errorMap: () => ({ message: "Role harus admin atau user" }) 
  }),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
});