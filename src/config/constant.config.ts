import { env } from "./env.config";

export const IS_PROD = env.NODE_ENV === "production";
