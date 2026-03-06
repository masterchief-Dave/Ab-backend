import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-response.utils";

const notFound = async (req: Request, res: Response, next: NextFunction) => {
  const notFoundError = ApiError.notFound("Route Not Found");
  next(notFoundError);
};

export default notFound;
