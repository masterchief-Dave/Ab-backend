import { z } from "zod";

export const validateObjectId = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "Invalid UUID",
  );

export const isoDateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export class ParamsSchema {
  static idParams(paramName: string, _paramLabel?: string) {
    return z.object({
      [paramName]: validateObjectId,
    });
  }

  static multipleIdParams(params: Array<{ name: string; label: string }>) {
    const schema: Record<string, z.ZodString> = {};

    for (const { name, label } of params) {
      schema[name] = z
        .string()
        .uuid(`${label} must be a valid UUID`)
        .min(1, `${label} is required`);
    }

    return z.object(schema);
  }
}
