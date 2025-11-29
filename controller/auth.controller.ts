import { Request, Response } from "express";
import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import { LILLY_AUTH } from "../utils/auth.utils.js";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/error/app-error.utils.js";

export namespace LILLY_AUTH_CONTROLLER {
  export async function authLogin(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) throw new AppError("No user found", StatusCodes.NOT_FOUND);

    //   confirm password
    const passwordVerify = await LILLY_AUTH.verifyPassword(
      password,
      user.password
    );

    if (!passwordVerify)
      throw new AppError("Wrong Password", StatusCodes.UNAUTHORIZED);

    // if password verified, sign the jwt token and send back to client
    const userId = (user._id as Types.ObjectId).toString();

    const token = await LILLY_AUTH.signJWT(userId);

    if (!token)
      throw new AppError(
        "Could not generate token",
        StatusCodes.INTERNAL_SERVER_ERROR
      );

    res.status(201).json({
      success: true,
      message: "Logged in",
      data: {
        token,
        userId,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
      },
    });
  }

  export const authSignUp = asyncHandler(async function authSignUp(
    req: Request,
    res: Response
  ) {
    const { email, password, name } = req.body;

    // check if user already exists
    const userExists = await User.findOne({
      email,
    });

    if (userExists)
      throw new AppError("User already exists", StatusCodes.BAD_REQUEST);

    //   hash password if new user

    const hashedPassword = await LILLY_AUTH.hashPassword(password);

    const user = await User.create({
      name: name as string,
      email: email as string,
      password: hashedPassword,
    });

    const userId = (user._id as Types.ObjectId).toString();

    const token = await LILLY_AUTH.signJWT(userId);

    if (!token)
      throw new AppError(
        "Could not generate token",
        StatusCodes.INTERNAL_SERVER_ERROR
      );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Successfully created account",
      token,
      userId,
      isAdmin: user.isAdmin,
      profilePicture: user.profilePicture,
    });
  });
}
