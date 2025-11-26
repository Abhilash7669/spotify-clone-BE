import { NextFunction, Response } from "express";
import { IAuthRequest } from "../interface/auth.interface.js";
import { AppError } from "../utils/error/app-error.utils.js";
import { StatusCodes } from "http-status-codes";

export default async function adminMiddleware(
  req: IAuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.isAdmin)
    throw new AppError("Unauthorized", StatusCodes.UNAUTHORIZED);

  next();
}
