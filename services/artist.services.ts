import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/error/app-error.utils.js";
import Artist from "../models/artist.model.js";
import { IArtist } from "../interface/artist.interface.js";

export namespace LILLY_ARTIST_SERVICE {
  export async function getArtistById(artistId: string): Promise<IArtist> {
    if (!artistId) {
      throw new AppError("No artist id found", StatusCodes.BAD_REQUEST);
    }

    const artist = await Artist.findById(artistId);

    if (!artist) {
      throw new AppError("No artist found", StatusCodes.NOT_FOUND);
    }

    return artist;
  }
}
