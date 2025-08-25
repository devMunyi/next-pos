import { z } from "zod";

import { SETTINGS } from "@/data/settings";

export const LoginFormSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export const RegisterFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(SETTINGS.AUTH.MINIMUM_USERNAME_LENGTH, {
        message: `Name must be at least ${SETTINGS.AUTH.MINIMUM_USERNAME_LENGTH} characters.`,
      })
      .max(SETTINGS.AUTH.MAXIMUM_USERNAME_LENGTH, {
        message: `Name must be at most ${SETTINGS.AUTH.MAXIMUM_USERNAME_LENGTH} characters.`,
      }),
    email: z.string().email().trim().toLowerCase(),
    role: z.enum(["CASHIER", "ADMIN"]),
    password: z
      .string()
      .trim()
      .min(SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH, {
        message: `Password must be at least ${SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH} characters.`,
      })
      .max(SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH, {
        message: `Password must be at most ${SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH} characters.`,
      }),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


// Extend the add user schema
export const addUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(SETTINGS.AUTH.MINIMUM_USERNAME_LENGTH, {
      message: `Name must be at least ${SETTINGS.AUTH.MINIMUM_USERNAME_LENGTH} characters.`,
    })
    .max(SETTINGS.AUTH.MAXIMUM_USERNAME_LENGTH, {
      message: `Name must be at most ${SETTINGS.AUTH.MAXIMUM_USERNAME_LENGTH} characters.`,
    }),
  email: z.string().email().trim().toLowerCase(),
  role: z.enum(["CASHIER", "ADMIN"]),
  password: z
    .string()
    .trim()
    .min(SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH, {
      message: `Password must be at least ${SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH} characters.`,
    })
    .max(SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH, {
      message: `Password must be at most ${SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH} characters.`,
    })
});

export const updateUserSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(SETTINGS.AUTH.MINIMUM_USERNAME_LENGTH, {
      message: `Name must be at least ${SETTINGS.AUTH.MINIMUM_USERNAME_LENGTH} characters.`,
    })
    .max(SETTINGS.AUTH.MAXIMUM_USERNAME_LENGTH, {
      message: `Name must be at most ${SETTINGS.AUTH.MAXIMUM_USERNAME_LENGTH} characters.`,
    }),
  email: z.string().email().trim().toLowerCase(),
  role: z.enum(["CASHIER", "ADMIN"]),
  password: z
    .string()
    .trim()
    // .min(SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH, {
    //   message: `Password must be at least ${SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH} characters.`,
    // })
    // .max(SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH, {
    //   message: `Password must be at most ${SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH} characters.`,
    // })
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type AddUserInput = z.infer<typeof addUserSchema>;