import asyncHandler from "express-async-handler";
import { IExtendedRequest } from "../interface/auth.interface.js";
import { Response } from "express";
import { AppError } from "../utils/error/app-error.utils.js";
import { StatusCodes } from "http-status-codes";
import { LILLY_SONG_SERVICE } from "../services/song.services.js";
import { LILLY_SERVICE_CLOUDINARY } from "../services/cloudinary.services.js";
import { UploadApiResponse } from "cloudinary";
import { EditSong } from "../types/song/song.types.js";
/**
 * create song - route done - controller done
 * get songs (with pagination, filtering) - route done - controller done
 * get song - route done - controller done
 * update song - route done - controller done
 * delete song - route done - controller done
 * get top songs
 * get new releases(recently added songs)
 */

export namespace LILLY_SONG_CONTROLLER {
  export const likeSong = asyncHandler(async function likeSong(
    req: IExtendedRequest,
    res: Response
  ) {
    const songId = req.params.id;
    const userId = req.userId;

    const data = {
      songId: songId as string,
      userId: userId as string,
    };

    await LILLY_SONG_SERVICE.likeSong(data);

    res.status(StatusCodes.OK).json({
      success: true,
    });
  });

  export const unikeSong = asyncHandler(async function unikeSong(
    req: IExtendedRequest,
    res: Response
  ) {
    const songId = req.params.id;
    const userId = req.userId;

    const data = {
      songId: songId as string,
      userId: userId as string,
    };
    await LILLY_SONG_SERVICE.unikeSong(data);

    res.status(StatusCodes.OK).json({
      success: true,
    });
  });

  export const addSong = asyncHandler(async function addSong(
    req: IExtendedRequest,
    res: Response
  ) {
    const {
      title,
      artistId,
      albumId,
      duration,
      releaseDate,
      genre,
      isExplicit,
      featuredArtists,
    } = req.body;

    let result: UploadApiResponse | null = null;
    if (req.file?.path) {
      result = await LILLY_SERVICE_CLOUDINARY.uploadCloudinary(req.file.path, {
        folder: "spotify/songs",
      });
    }

    if (!result) {
      throw new AppError(
        "Error uploading song",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const song = await LILLY_SONG_SERVICE.addSong({
      artist: artistId,
      audioURL: result.secure_url,
      duration: duration,
      title,
      album: albumId,
      releaseDate,
      genre,
      isExplicit,
      featuredArtists,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Song added successfully",
      data: song,
    });
  });

  export const getSongs = asyncHandler(async function getSongs(
    req: IExtendedRequest,
    res: Response
  ) {
    const { limit, page, search } = req.query;
    const songs = await LILLY_SONG_SERVICE.getSongs({
      limit: limit as string,
      page: page as string,
      search: search as string,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Fetched songs", // TODO: Better message
      ...songs,
    });
  });

  export const getSong = asyncHandler(async function getSong(
    req: IExtendedRequest,
    res: Response
  ) {
    const songId = req.params.id;
    const song = await LILLY_SONG_SERVICE.getSong(songId, {
      populate: [{ path: "name", select: "name image" }],
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Song fetched",
      data: song,
    });
  });

  export const editSong = asyncHandler(async function editSong(
    req: IExtendedRequest,
    res: Response
  ) {
    const {
      title,
      artistId,
      albumId,
      duration,
      releaseDate,
      genre,
      isExplicit,
      featuredArtists,
      song,
    } = req.body;

    console.log(req.file, "REQUEST FILE");

    let data: EditSong = {
      album: albumId,
      artist: artistId,
      title,
      duration,
      releaseDate,
      genre,
      isExplicit,
      featuredArtists,
      song,
    };
    const editedSong = await LILLY_SONG_SERVICE.editSong(
      req.params.id,
      data,
      req.files
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Edited song successfully",
      data: editedSong,
    });
  });

  export const deleteSong = asyncHandler(async function deleteSong(
    req: IExtendedRequest,
    res: Response
  ) {
    const songId = req.params.id;
    const { artistId } = req.body;
    await LILLY_SONG_SERVICE.deleteSong(songId, artistId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Deleted Song successfully",
    });
  });
}
