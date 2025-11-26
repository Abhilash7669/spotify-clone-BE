import asyncHandler from "express-async-handler";

import { NextFunction, Response } from "express";
import { IExtendedRequest } from "../interface/auth.interface.js";
import { AppError } from "../utils/error/app-error.utils.js";
import { StatusCodes } from "http-status-codes";
import fsAsync from "fs/promises";
import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.config.js";

// TODO: Re-work to make it reusable inside controllers instead as a middleware

export namespace LILLY_SERVICE_CLOUDINARY {
  export const uploadImage = asyncHandler(async function uploadImage(
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ) {
    if (!req.filePath) {
      next();
      return;
    }
    const filePath = req.filePath;

    const result: UploadApiResponse = await cloudinary.uploader.upload(
      `${filePath}`,
      {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: "image",
      }
    );

    if (!result) {
      fsAsync.unlink(filePath as string);
      throw new AppError(
        "Error uploading to cloudinary",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    fsAsync.unlink(filePath as string);
    req.secure_url = result.secure_url;
    next();
  });

  export const uploadAudio = asyncHandler(async function uploadImage(
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ) {
    if (!req.filePath) {
      next();
      return;
    }
    const filePath = req.filePath;

    const result: UploadApiResponse = await cloudinary.uploader.upload(
      `${filePath}`,
      {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: "video",
      }
    );

    if (!result) {
      fsAsync.unlink(filePath as string);
      throw new AppError(
        "Error uploading to cloudinary",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    fsAsync.unlink(filePath as string);
    req.secure_url = result.secure_url;
    next();
  });

  // re-worked, replace above
  export async function uploadCloudinary(
    filePath: string,
    options?: UploadApiOptions
  ) {
    if (!filePath) {
      throw new AppError("No file path", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    let _options: UploadApiOptions = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      resource_type: "auto",
      ...options,
    };

    const result = await cloudinary.uploader.upload(filePath, _options);
    fsAsync.unlink(filePath as string);
    if (!result) {
      throw new AppError(
        "Error uploading to cloudinary",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return result;
  }
}
