import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import { Prisma } from "../../generated/prisma/client";

import { env } from "../config/env.config";
import { logger } from "./logger.middleware";
import { formatUnknownError } from "../utils/helpers/format-helper.utils";

const excludedCodes = [405];

interface ApiErrorLike extends Error {
  statusCode: number;
  status?: string;
}

function isApiError(err: unknown): err is ApiErrorLike {
  return (
    err instanceof Error &&
    typeof (err as Partial<ApiErrorLike>).statusCode === "number"
  );
}

function getPrismaTarget(
  meta: Prisma.PrismaClientKnownRequestError["meta"],
): string[] {
  if (!meta || typeof meta !== "object") return [];

  const target = (meta as { target?: unknown }).target;

  if (Array.isArray(target) && target.every((t) => typeof t === "string")) {
    return target;
  }

  if (typeof target === "string") {
    return [target];
  }

  return [];
}

export const errorMiddleware: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  /* ---------- logging ---------- */
  if (env.NODE_ENV !== "production") {
    if (err instanceof Error) {
      const statusCode = isApiError(err) ? err.statusCode : undefined;

      logger.fatal(
        statusCode && excludedCodes.includes(statusCode)
          ? err.message
          : (err.stack ?? err.message),
      );
    } else {
      logger.fatal(`Unknown error type thrown: ${formatUnknownError(err)}`);
    }
  }

  /* ---------- API errors ---------- */
  if (isApiError(err)) {
    const { statusCode, message, status, stack } = err;

    return void res.status(statusCode).json({
      success: false,
      status,
      status_code: statusCode,
      message,
      stack: env.NODE_ENV === "production" ? undefined : stack,
    });
  }

  /* ---------- Prisma known request errors ---------- */
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const status_code = 409;
      const fields = getPrismaTarget(err.meta);

      let message =
        env.NODE_ENV === "production" ? "Conflict" : "Unique constraint failed";

      if (fields.includes("email")) {
        message = "User with this email already exists";
      }

      return void res.status(status_code).json({
        success: false,
        status: "Conflict",
        status_code,
        message,
        stack: env.NODE_ENV === "production" ? undefined : err.stack,
      });
    }

    if (err.code === "P2025") {
      const status_code = 404;
      const message = env.NODE_ENV === "production" ? "Not Found" : err.message;

      return void res.status(status_code).json({
        success: false,
        status: "Not Found",
        status_code,
        message,
        stack: env.NODE_ENV === "production" ? undefined : err.stack,
      });
    }
  }

  /* ---------- Prisma validation errors ---------- */
  if (err instanceof Prisma.PrismaClientValidationError) {
    const status_code = 400;
    const message = env.NODE_ENV === "production" ? "Bad Request" : err.message;

    return void res.status(status_code).json({
      success: false,
      status: "Bad Request",
      status_code,
      message,
      stack: env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }

  /* ---------- fallback ---------- */
  const message =
    err instanceof Error && err.message ? err.message : "Internal Server Error";

  const stack = err instanceof Error ? err.stack : undefined;

  return void res.status(500).json({
    success: false,
    status: "Error",
    status_code: 500,
    message,
    stack: env.NODE_ENV === "production" ? undefined : stack,
  });
};
