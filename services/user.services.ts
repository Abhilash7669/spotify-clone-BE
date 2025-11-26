import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/error/app-error.utils.js";
import User from "../models/user.model.js";
import { IUser } from "../interface/user.interface.js";

export namespace LILLY_SERVICE_USER {
  export async function getUserById(userId: string): Promise<IUser> {
    if (!userId) {
      throw new AppError("No user id found", StatusCodes.BAD_REQUEST);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("No user found", StatusCodes.NOT_FOUND);
    }

    return user;
  }
}
