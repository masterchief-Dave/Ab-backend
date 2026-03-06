import * as z from "zod";
import { GenderEnum, OtpReasonEnum } from "../../../generated/prisma/enums";

export class AuthSchemas {
  static register = z
    .object({
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      email: z.email("Please provide a valid email address").toLowerCase(),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(100),
      gender: z.enum(GenderEnum),
    })
    .strict();

  static login = z
    .object({
      email: z.email("Please provide a valid email address").toLowerCase(),
      password: z.string().max(100),
    })
    .strict();

  static verifyOTP = z
    .object({
      email: z.email("Please provide a valid email address").toLowerCase(),
      otp: z.string().min(6, "OTP must be at least 6 characters long").max(6),
      reason: z.enum(OtpReasonEnum),
    })
    .strict();

  static sendOTP = z
    .object({
      email: z.email("Please provide a valid email address").toLowerCase(),
      reason: z.enum(OtpReasonEnum),
    })
    .strict();

  static forgotPassword = z
    .object({
      email: z.email("Please provide a valid email address").toLowerCase(),
    })
    .strict();

  static resetPassword = z
    .object({
      email: z.email("Please provide a valid email address"),
      otp: z.string().min(6, "OTP must be at least 6 characters long").max(6),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(100),
      reason: z.enum(OtpReasonEnum),
    })
    .strict();
}

export type VerifyOtpDTO = z.infer<typeof AuthSchemas.verifyOTP>;
export type LoginDto = z.infer<typeof AuthSchemas.login>;
export type RegisterDto = z.infer<typeof AuthSchemas.register>;
