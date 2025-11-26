import { NextFunction, Response } from "express";
import { LILLY_AUTH } from "../utils/auth.utils.js";
import User from "../models/user.model.js";
import { IAuthRequest } from "../interface/auth.interface.js";
import { AppError } from "../utils/error/app-error.utils.js";
import { StatusCodes } from "http-status-codes";

export default async function authMiddleware(
  req: IAuthRequest,
  res: Response,
  next: NextFunction
) {
  let token: string | null = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    // take token and verify with jwt
    // if verified extract userId and append into request and call next
    const decoded = await LILLY_AUTH.verifyJWT<{ userId: string }>(token);
    const userId = decoded.userId as string;

    //   find if user exists in our database
    const userExists = await User.findById(userId);

    if (!userExists)
      throw new AppError("User does not exist", StatusCodes.BAD_REQUEST);

    req.userId = userId; // appending userId into request object and pass it on
    req.isAdmin = userExists.isAdmin;
    req.profilePicture = userExists.profilePicture;

    next();
  } else {
    throw new AppError("Unauthorized user", StatusCodes.UNAUTHORIZED);
  }
}
