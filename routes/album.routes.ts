import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { LILLY_ALBUM_CONTROLLER } from "../controller/album.controller.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import { LILLY_SERVICE_CLOUDINARY } from "../services/cloudinary.services.js";
import { LILLY_MULTER } from "../services/multer.services.js";

const albumRouter = Router();

/**
 * @desc Get Albums (artistId optional)
 * @route - GET /api/v1/albums?artistId=asda131&limit=10&search=dark&page=2
 * @Access Public
 */
albumRouter.get("/", authMiddleware, LILLY_ALBUM_CONTROLLER.getAlbums);

/**
 * @desc Get Recently added albums
 * @route - GET /api/v1/albums/recent-albums?limit=10
 * @access Public
 */
albumRouter.get(
  "/recent-albums",
  authMiddleware,
  LILLY_ALBUM_CONTROLLER.getRecentlyAddedAlbums
);
/**
 * @desc Get Album by id
 * @route - GET /api/v1/albums/:id
 * @Access Public
 */
albumRouter.get("/:id", authMiddleware, LILLY_ALBUM_CONTROLLER.getAlbumById);

/**
 * @desc Create Album
 * @route - POST /api/v1/albums/create
 * @access Private
 */
albumRouter.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  LILLY_MULTER.createMulterStorage({ filePath: "uploads/album/image" }).single(
    "coverImage"
  ),
  LILLY_SERVICE_CLOUDINARY.uploadImage,
  LILLY_ALBUM_CONTROLLER.createAlbum
);

/**
 * @desc Update an album
 * @route - PUT /api/v1/albums/:id/edit
 * @access Private
 */
albumRouter.put(
  "/:id/edit",
  authMiddleware,
  adminMiddleware,
  LILLY_MULTER.createMulterStorage({ filePath: "uploads/album/image" }).single(
    "coverImage"
  ),
  LILLY_SERVICE_CLOUDINARY.uploadImage,
  LILLY_ALBUM_CONTROLLER.editAlbum
);

/**
 * @desc Delete an album
 * @route - DELETE /api/v1/albums/:id
 * @access Private
 */
albumRouter.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  LILLY_ALBUM_CONTROLLER.deleteAlbum
);

/**
 * @desc - Add songs to album
 * @route - PUT /api/v1/albums/:id/add-songs
 * @access - Private
 */
albumRouter.put(
  "/:id/add-songs",
  authMiddleware,
  adminMiddleware,
  LILLY_ALBUM_CONTROLLER.addSongsToAlbum
);

/**
 * @desc - Remove songs from album
 * @route - PUT /api/v1/albums/:id/delete-songs
 * @access - Private
 */
albumRouter.put(
  "/:id/delete-songs",
  authMiddleware,
  adminMiddleware,
  LILLY_ALBUM_CONTROLLER.removeSongsFromAlbum
);

export default albumRouter;
