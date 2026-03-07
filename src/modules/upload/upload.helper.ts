import crypto from "node:crypto";
import { env } from "../../config/env.config";

type Signable = Record<string, string | number | boolean | undefined>;

export const signCloudinaryParams = (params: Signable, apiSecret: string) => {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto
    .createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");
};

export const randomNonce = () => crypto.randomBytes(12).toString("hex");

export const DEFAULT_ALLOWED_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif", // images
  "pdf", // docs (start small; extend if needed)
] as const;

export type AllowedFormatsKey = "images" | "images+pdf" | "pdf-only" | "all";

export const ALLOWED_FORMATS_MAP: Record<AllowedFormatsKey, readonly string[]> =
  {
    images: ["jpg", "jpeg", "png", "webp", "gif"],
    "images+pdf": ["jpg", "jpeg", "png", "webp", "gif", "pdf"],
    "pdf-only": ["pdf"],
    all: DEFAULT_ALLOWED_FORMATS,
  };

export const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._/-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_./]+|[-_./]+$/g, "");

export type Strategy = "static" | "append-timestamp" | "append-hash";

export type SlotPolicy = {
  allowedKey?: AllowedFormatsKey;
  strategy?: Strategy;
  overwrite?: boolean;
  maxMB?: number;
};

export type SlotPolicies = Record<string, SlotPolicy>;

export function safeParsePolicies(json?: string): SlotPolicies {
  try {
    return json ? (JSON.parse(json) as SlotPolicies) : {};
  } catch {
    return {};
  }
}

export const buildFolder = (userKey: string, entity?: string) => {
  const ns = slugify(env.UPLOAD_BASE_NAMESPACE);
  const own = encodeURIComponent(slugify(userKey));
  const ent = slugify(entity || env.UPLOAD_DEFAULT_ENTITY);
  return `${ns}/${ent}/${own}`;
};

export const buildPublicId = (fileBase: string) => {
  const b = slugify(fileBase);
  return `${b}-${Date.now()}-${randomNonce()}`;
};
