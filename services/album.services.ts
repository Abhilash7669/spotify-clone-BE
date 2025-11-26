import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/error/app-error.utils.js";
import Album from "../models/album.model.js";

export namespace LILLY_ALBUM_SERVICE {
  export async function getAlbumById(albumId: string) {
    if (!albumId) {
      throw new AppError("No album id found", StatusCodes.BAD_REQUEST);
    }

    const album = await Album.findById(albumId);

    if (!album) {
      throw new AppError("No album found", StatusCodes.NOT_FOUND);
    }

    return album;
  }
}
