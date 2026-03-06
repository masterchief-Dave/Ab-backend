import { z } from "zod";

const EnvConfig = z.object({
  ADMIN_EMAIL: z.string().min(1).default("admin@example.com"),
  APP_NAME: z.string().default("Core HR"),
  CLOUDINARY_NAME: z.string().min(1).default("cloudinary_name"),
  CLOUDINARY_API_KEY: z.string().min(1).default("api_key"),
  CLOUDINARY_API_SECRET: z.string().min(1).default("secret"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://user:password@localhost:5432/dbname"),
  BREVO_EMAIL: z.string().min(1).default("example@email.com"),
  BREVO_PASSWORD: z.string().min(1),
  EMAIL_REPLY_TO: z.string().min(1).default("example@email.com"),
  EMAIL_SENDER: z.string().min(1).default("example@email.com"),
  JWT_SECRET: z.string().min(1).default("secret"),
  NODE_ENV: z.string().default("development"),
  ORGANIZATION_TIMEZONE: z.string().default("UTC"),
  REDIS_HOST: z.string().min(1).default("localhost"),
  REDIS_PORT: z.coerce.number().min(1).default(6379),
  PORT: z.coerce.number().default(5000),
  WEB_APP_URL: z.url(),
});

export type Env = z.infer<typeof EnvConfig>;
export const env: Env = EnvConfig.parse(process.env);
