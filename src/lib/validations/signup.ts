import { z } from "zod";

export const OTP_LENGTH = 8;

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((p) => (p.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length >= 1, {
    message: "Password must contain at least 1 special character",
  })
  .refine((p) => (p.match(/[A-Z]/g) || []).length >= 2, {
    message: "Password must contain at least 2 uppercase letters",
  })
  .refine((p) => (p.match(/[a-z]/g) || []).length >= 2, {
    message: "Password must contain at least 2 lowercase letters",
  })
  .refine((p) => (p.match(/\d/g) || []).length >= 2, {
    message: "Password must contain at least 2 numbers",
  });

export const signupFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    birthday: z.string().optional(),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    otp: z
      .string()
      .refine((v) => v === "" || (v.length === OTP_LENGTH && new RegExp(`^\\d{${OTP_LENGTH}}$`).test(v)), {
        message: `Enter ${OTP_LENGTH}-digit code`,
      }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signupOtpSchema = z.object({
  otp: z
    .string()
    .min(1, "Code is required")
    .length(OTP_LENGTH, `Enter ${OTP_LENGTH}-digit code`)
    .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter ${OTP_LENGTH} digits`),
});

export type SignupForm = z.infer<typeof signupFormSchema>;
