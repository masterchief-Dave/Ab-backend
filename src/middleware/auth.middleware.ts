import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-response.utils";
import { userRepository } from "../modules/user/user.repository";
import { verifyAuthToken } from "../utils/token.utils";

const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.cookies.accessToken;
  if (!authHeader) {
    throw ApiError.unauthorized("No token provided");
  }

  const token = authHeader;
  const payload = verifyAuthToken(token as string);
  if (!payload || !payload.userId) {
    throw ApiError.unauthorized("Unauthorized");
  }

  const user = await userRepository.findById(payload.userId);

  if (
    !user ||
    !user.isActive ||
    !user.isVerified ||
    user.passwordVersion !== payload.passwordVersion ||
    user.jwtVersion !== payload.jwtVersion
  ) {
    throw ApiError.unauthorized("Session expired, please login again");
  }

  const userPayload = {
    id: user.id as string,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
  };

  req.user = userPayload;
  next();
};

export { isAuth };
