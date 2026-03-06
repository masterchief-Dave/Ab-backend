import type { Request, Response } from "express";
import { ApiError } from "../utils/api-response.utils";

const methodNotAllowed = (req: Request, _res: Response) => {
  throw ApiError.methodNotAllowed(
    `Method ${req.method} not allowed on ${req.originalUrl}`,
  );
};

export default methodNotAllowed;
