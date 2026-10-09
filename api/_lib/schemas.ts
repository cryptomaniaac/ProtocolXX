import { z } from 'zod'

/** Schema for POST /api/send-otp */
export const sendOtpSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Enter a valid email address.' })
    .max(254, { message: 'Email address is too long.' })
    .transform((v) => v.trim().toLowerCase()),
})

/** Schema for POST /api/verify-otp */
export const verifyOtpSchema = z.object({
  token: z
    .string()
    .min(1, { message: 'Verification token is missing.' }),
  otp: z
    .string()
    .min(1, { message: 'Code is required.' })
    .regex(/^\d{6}$/, { message: 'Enter the 6-digit code from your inbox.' }),
})


export type SendOtpInput = z.infer<typeof sendOtpSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
