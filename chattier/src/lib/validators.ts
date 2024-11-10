import { z } from "zod"

/**
 * Validator schema for user sign-up credentials.
 *
 * This schema validates the following fields:
 * - `name`: A string with a minimum length of 3 characters.
 * - `email`: A valid email address.
 * - `password`: A string with a minimum length of 8 characters.
 * - `confirmPassword`: A string with a minimum length of 8 characters.
 *
 * It also ensures that the `password` and `confirmPassword` fields match.
 *
 * @type {z.ZodSchema<{
 *   name: string;
 *   email: string;
 *   password: string;
 *   confirmPassword: string;
 * }>}
 */
export const SignUpCredentialsValidator: z.ZodSchema<{
  name: string
  email: string
  password: string
  confirmPassword: string
}> = z
  .object({
    name: z.string().min(3, {
      message: "Name must be at least 3 characters long.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Confirm password must be at least 8 characters long.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

/**
 * Type inferred from `SignUpCredentialsValidator`.
 *
 * @typedef {Object} TSignUpCredentialsValidator
 * @property {string} name - The user's name.
 * @property {string} email - The user's email address.
 * @property {string} password - The user's password.
 * @property {string} confirmPassword - The user's password confirmation.
 */
export type TSignUpCredentialsValidator = z.infer<
  typeof SignUpCredentialsValidator
>

/**
 * Validator schema for user sign-in credentials.
 *
 * This schema validates the following fields:
 * - `email`: A valid email address.
 * - `password`: A string with a minimum length of 8 characters.
 *
 * @type {z.ZodSchema<{
 *   email: string;
 *   password: string;
 * }>}
 */
export const SignInCredentialsValidator = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
})

/**
 * Type inferred from `SignInCredentialsValidator`.
 *
 * @typedef {Object} TSignInCredentialsValidator
 * @property {string} email - The user's email address.
 * @property {string} password - The user's password.
 */
export type TSignInCredentialsValidator = z.infer<
  typeof SignInCredentialsValidator
>

/**
 * Validator schema for password reset credentials.
 *
 * This schema validates the following field:
 * - `email`: A valid email address.
 *
 * @type {z.ZodSchema<{
 *   email: string;
 * }>}
 */
export const ResetPasswordCredentialsValidator: z.ZodSchema<{
  email: string
}> = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

/**
 * Type inferred from `ResetPasswordCredentialsValidator`.
 *
 * @typedef {Object} TResetPasswordCredentialsValidator
 * @property {string} email - The user's email address.
 */
export type TResetPasswordCredentialsValidator = z.infer<
  typeof ResetPasswordCredentialsValidator
>
