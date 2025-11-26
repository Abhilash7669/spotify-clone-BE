import { Router } from "express";
import { LILLY_ARTIST_CONTROLLER } from "../controller/artist.controller.js";
import { LILLY_MULTER } from "../services/multer.services.js";
import { LILLY_SERVICE_CLOUDINARY } from "../services/cloudinary.services.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const artistRouter = Router();

/**
 * @desc Get all artists
 * @route - GET /api/v1/artists?genre=Rock&serach=pink&page=1&limit=10
 * @Access Public
 */
artistRouter.get("/", authMiddleware, LILLY_ARTIST_CONTROLLER.getArtists);

/**
 * @desc Get all top artists
 * @route - GET /api/v1/artists/top?limit=10
 * @Access Public
 */
artistRouter.get("/top", authMiddleware, LILLY_ARTIST_CONTROLLER.getTopArtists);

/**
 * @desc Get an artist
 * @route - GET /api/v1/artists/:id
 * @Access Public
 */
artistRouter.get("/:id", authMiddleware, LILLY_ARTIST_CONTROLLER.getArtist);

/**
 * @desc Get artist top songs
 * @route - GET /api/v1/artists/:id/top-songs
 * @Access Public
 */
artistRouter.get(
  "/:id/top-songs",
  authMiddleware,
  LILLY_ARTIST_CONTROLLER.getArtistTopSongs
);

/**
 * @desc Create an artist
 * @route - GET /api/v1/artists/create
 * @Access Private
 */
artistRouter.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  LILLY_MULTER.createMulterStorage({ filePath: "uploads/artist/image" }).single(
    "image"
  ),
  LILLY_SERVICE_CLOUDINARY.uploadImage,
  LILLY_ARTIST_CONTROLLER.createArtist
);

/**
 * @desc Edit an artist
 * @route - PUT /api/v1/artists/edit/:id
 * @Access Private
 */
artistRouter.put(
  "/edit/:id",
  authMiddleware,
  adminMiddleware,
  LILLY_MULTER.createMulterStorage({ filePath: "uploads/artist/image" }).single(
    "image"
  ),
  LILLY_SERVICE_CLOUDINARY.uploadImage,
  LILLY_ARTIST_CONTROLLER.editArtist
);

/**
 * @desc Delete an artist and related songs and albums
 * @route - DELETE /api/v1/artists/:id
 * @Access Private
 */
artistRouter.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  LILLY_ARTIST_CONTROLLER.deleteArtist
);

export default artistRouter;
