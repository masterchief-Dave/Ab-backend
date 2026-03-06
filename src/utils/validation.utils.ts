import { ApiError } from "./api-response.utils";

const BCRYPT_OPTIONS = {
  algorithm: "bcrypt" as const,
  cost: 10,
};

const verifySecretOrThrow = async (
  incoming: string,
  existingHash: string,
  onMismatch: () => Error,
): Promise<void> => {
  const isMatch = await Bun.password.verify(incoming, existingHash);
  if (!isMatch) throw onMismatch();
};

const requireNonEmpty = (label: "password" | "OTP", value?: string) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    const msg =
      label === "password"
        ? "Please provide a password"
        : "Please provide an OTP";
    throw ApiError.badRequest(msg);
  }
};

const hashSecret = async (secret: string): Promise<string> => {
  return Bun.password.hash(secret, BCRYPT_OPTIONS);
};

/**
 * Hash an OTP.
 * @throws {ApiError} if OTP is missing/empty.
 */
export const hashOTP = async (otpCode: string): Promise<string> => {
  requireNonEmpty("OTP", otpCode);
  return hashSecret(otpCode);
};

/**
 * Compare an incoming OTP with an existing hashed OTP.
 * @throws {ApiError} if inputs are missing/empty or if they don't match.
 */
export const compareOTP = async (
  incomingOTP: string,
  existingOTP: string,
): Promise<void> => {
  requireNonEmpty("OTP", incomingOTP);
  requireNonEmpty("OTP", existingOTP);
  await verifySecretOrThrow(incomingOTP, existingOTP, () =>
    ApiError.unauthorized("OTP incorrect"),
  );
};
