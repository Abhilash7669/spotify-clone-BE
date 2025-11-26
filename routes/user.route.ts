import { Router } from "express";
import { LILLY_USER_CONTROLLER } from "../controller/user-profile.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { LILLY_MULTER } from "../services/multer.services.js";
import { LILLY_SERVICE_CLOUDINARY } from "../services/cloudinary.services.js";

const userRouter = Router();

userRouter.get("/:id", authMiddleware, LILLY_USER_CONTROLLER.getUser);
userRouter.put("/edit/:id", authMiddleware, LILLY_USER_CONTROLLER.editUser);
userRouter.put(
  "/edit/:id/avatar",
  authMiddleware,
  LILLY_MULTER.createMulterStorage({ filePath: "uploads/user/avatar" }).single(
    "lilly"
  ),
  LILLY_SERVICE_CLOUDINARY.uploadImage,
  LILLY_USER_CONTROLLER.saveUserProfilePicture
);

export default userRouter;
