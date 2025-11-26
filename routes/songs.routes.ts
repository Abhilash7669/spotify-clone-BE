import { Router } from "express";
import { LILLY_MULTER } from "../services/multer.services.js";
import { LILLY_SERVICE_CLOUDINARY } from "../services/cloudinary.services.js";
import { LILLY_SONG_CONTROLLER } from "../controller/song.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const songsRouter = Router();

/**
 * @desc Add Song
 * @route Post /api/v1/songs/add
 * @access Private
 */
songsRouter.post(
  "/add",
  authMiddleware,
  adminMiddleware,
  // LILLY_MULTER.createMulterStorage({ filePath: "uploads/song" }).single("song"),
  LILLY_MULTER.multerStorage().single("song"),
  LILLY_SONG_CONTROLLER.addSong
);

/**
 * @desc Get Songs
 * @route Get /api/v1/songs?limit=10&page=1&search=song_name
 * @access Public
 */
songsRouter.get("/", authMiddleware, LILLY_SONG_CONTROLLER.getSongs);

/**
 * @desc Get Song
 * @route Get /api/v1/songs/:id
 * @access Public
 */
songsRouter.get("/:id", authMiddleware, LILLY_SONG_CONTROLLER.getSong);

/**
 * @desc Edit Song
 * @route Put /api/v1/songs/:id
 * @access Private
 */
songsRouter.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  LILLY_MULTER.multerStorage().fields([
    { name: "coverImage", maxCount: 1 },
    { name: "song", maxCount: 1 },
  ]),
  LILLY_SONG_CONTROLLER.editSong
);

/**
 * @desc Like Song
 * @route Put /api/v1/songs/:id/like
 * @access Public
 */
songsRouter.put("/:id/like", authMiddleware, LILLY_SONG_CONTROLLER.likeSong);

/**
 * @desc Un-Like Song
 * @route Put /api/v1/songs/:id/unlike
 * @access Public
 */
songsRouter.put("/:id/unlike", authMiddleware, LILLY_SONG_CONTROLLER.unikeSong);

/**
 * @desc Delete a Song
 * @route Delete /api/v1/songs/:id
 * @access Private
 */
songsRouter.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  LILLY_SONG_CONTROLLER.deleteSong
);

export default songsRouter;
