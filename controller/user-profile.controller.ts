import asyncHandler from "express-async-handler";
import {
  IAuthFileRequest,
  IAuthRequest,
  IExtendedRequest,
} from "../interface/auth.interface.js";
import { NextFunction, Response, Request } from "express";
import User from "../models/user.model.js";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/error/app-error.utils.js";
import { LILLY_AUTH } from "../utils/auth.utils.js";

export namespace LILLY_USER_CONTROLLER {
  export const getUser = asyncHandler(async function getUser(
    req: IAuthRequest,
    res: Response
  ) {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) throw new AppError("User not found", StatusCodes.NOT_FOUND);

    res.status(StatusCodes.OK).json({
      success: true,
      user,
    });
  });

  export const editUser = asyncHandler(async function editUser(
    req: IAuthFileRequest,
    res: Response,
    next: NextFunction
  ) {
    const { name, email, password } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) throw new AppError("No user found", StatusCodes.NOT_FOUND);

    if (name || email) {
      user.email = email || user.email;
      user.name = name || user.name;
    }

    if (password) {
      const hashedPassword = await LILLY_AUTH.hashPassword(password);
      user.password = hashedPassword;
    }

    if (req.file) {
      // const result: UploadApiResponse = await LILLY_CLOUDINARY.cloudinaryUpload(
      //   req.file.path,
      //   "/spotify/users"
      // );
      // user.profilePicture = result.secure_url;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      name,
    });
  });

  export const saveUserProfilePicture = asyncHandler(
    async function saveUserProfilePicture(
      req: IExtendedRequest,
      res: Response
    ) {
      const userId = req.params.id;

      if (!userId) throw new AppError("Unauthorized", StatusCodes.BAD_REQUEST);

      if (!req.secure_url)
        throw new AppError(
          "Something went wrong during upload",
          StatusCodes.INTERNAL_SERVER_ERROR
        );

      const user = await User.findByIdAndUpdate(
        userId,
        {
          profilePicture: req.secure_url,
        },
        { new: true }
      );

      if (!user) throw new AppError("No user found", StatusCodes.NOT_FOUND);

      res.status(StatusCodes.OK).json({
        success: true,
        url: user.profilePicture,
      });
    }
  );
}
