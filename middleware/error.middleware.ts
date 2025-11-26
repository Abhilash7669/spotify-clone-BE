import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/error/app-error.utils.js";

export async function errorMiddleware(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { message, status } = err;

  res.status(status || 500).json({
    success: false,
    message: message,
  });
}
