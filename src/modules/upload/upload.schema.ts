import z from "zod";

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export class UploadSchema {
  static signature = z.object({
    fileBase: z.string().min(1).max(120),
    entity: z.string().min(1).optional(),
    replace: z.boolean().optional(),
  });

  static publicSignature = z.object({
    mimeType: z.enum(ALLOWED_MIME_TYPES),
    captchaToken: z.string().min(1, "Captcha token is required").optional(),
  });
}

export type UploadSignatureDTO = z.infer<typeof UploadSchema.signature>;
export type PublicUploadSignatureDTO = z.infer<
  typeof UploadSchema.publicSignature
>;
