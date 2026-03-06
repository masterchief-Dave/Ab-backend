import { ApiError } from "./api-response.utils";

// Hash password
export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw ApiError.badRequest("Please provide a password");
  }
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
  return hashedPassword;
}

/**
 * Compares an incoming password with an existing hashed password.
 *
 * @param incomingPassword - The password to verify.
 * @param existingPassword - The hashed password to compare against.
 * @throws {ApiError} If either password is not provided or if the passwords do not match.
 */
export async function comparePassword(
  incomingPassword: string,
  existingPassword: string,
): Promise<void> {
  if (!incomingPassword || !existingPassword) {
    throw ApiError.badRequest("Please provide a password");
  }
  const isMatch = await Bun.password.verify(incomingPassword, existingPassword);
  if (!isMatch) {
    throw ApiError.unauthorized("Password or email is incorrect");
  }
}

export const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export const ngPhoneRegex = /^(?:\+234|0)(7|8|9){1}(0|1){1}[0-9]{8}$/;
