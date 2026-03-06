import jwt, {
  type JwtPayload,
  type SignOptions,
  type VerifyOptions,
} from "jsonwebtoken";
import { env } from "../config/env.config";
import { ApiError } from "./api-response.utils";
import type { AuthenticatedUser } from "../modules/auth/auth.interface";
import type { StringValue } from "ms";

interface CustomJwtPayload extends JwtPayload, AuthenticatedUser {}

interface TokenPayload {
  [key: string]: unknown;
}

const JWT_SECRET = env.JWT_SECRET;

export const generateAuthToken = (
  payload: TokenPayload,
  duration: string,
): string => {
  const options: SignOptions = { expiresIn: duration as StringValue };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyAuthToken = (token: string): CustomJwtPayload => {
  const options: VerifyOptions = {};
  try {
    const payload = jwt.verify(token, JWT_SECRET, options) as CustomJwtPayload;
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Token Expired");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Invalid Token");
    }

    throw error;
  }
};
