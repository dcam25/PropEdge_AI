import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  birthday: z.string().optional(),
});

export const profileSaveSchema = profileSchema.pick({
  firstName: true,
  lastName: true,
  birthday: true,
});

export type ProfileForm = z.infer<typeof profileSchema>;
