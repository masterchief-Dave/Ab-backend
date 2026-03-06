import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

// Middleware to validate request body using Zod
export const validateBody =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => {
          return {
            field: err.path.join("."),
            message:
              err.code === "unrecognized_keys"
                ? `Unrecognized key(s): ${err.keys?.join(", ")}`
                : err.message.replaceAll('"', " "),
          };
        });

        return void res.status(422).json({
          success: false,
          status: "Validation Error",
          status_code: 422,
          errors,
        });
      }

      return next(error);
    }
  };

export const validateAsyncBody =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => {
          return {
            field: err.path.join("."),
            message:
              err.code === "unrecognized_keys"
                ? `Unrecognized key(s): ${err.keys?.join(", ")}`
                : err.message,
          };
        });

        return void res.status(422).json({
          success: false,
          status: "Validation Error",
          status_code: 422,
          errors,
        });
      }

      return next(error);
    }
  };

export const validateParams =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path[0],
          message:
            err.code === "unrecognized_keys"
              ? `Unrecognized key(s): ${err.keys?.join(", ")}`
              : err.message,
        }));

        return void res.status(400).json({
          success: false,
          status: "Invalid Params",
          status_code: 400,
          errors,
        });
      }

      return next(error);
    }
  };

export const validateQuery =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path[0],
          message:
            err.code === "unrecognized_keys"
              ? `Unrecognized key(s): ${err.keys?.join(", ")}`
              : err.message,
        }));

        return void res.status(400).json({
          success: false,
          status: "Invalid Query Parameters",
          status_code: 400,
          errors,
        });
      }

      return next(error);
    }
  };
