import { NextFunction, Response } from "express";
import asyncHandler from "express-async-handler";
import { AppError } from "../utils/error/app-error.utils.js";
import { StatusCodes } from "http-status-codes";
import Artist from "../models/artist.model.js";
import { IExtendedRequest } from "../interface/auth.interface.js";
import { FilterQuery } from "mongoose";
import Song from "../models/song.model.js";
import Album from "../models/album.model.js";


/**
 * create artist
 * edit artist
 * delete artist
 * get artist
 * get artists
 * get top(n) artists
 * get artists top(n) songs
 */

export namespace LILLY_ARTIST_CONTROLLER {
  export const createArtist = asyncHandler(async function createArtist(
    req: IExtendedRequest,
    res: Response
  ) {
    const { name, bio, genres } = req.body;

    if (!name || !bio || !genres)
      throw new AppError(
        "Name, bio, and genres are required ",
        StatusCodes.BAD_REQUEST
      );

    // check if artist already exists
    const artist = await Artist.findOne({
      name,
    });

    if (artist)
      throw new AppError("Artist already exists", StatusCodes.BAD_REQUEST);

    let imageUrl: string = "";

    if (req.secure_url) imageUrl = req.secure_url as string;

    const createdArtist = await Artist.create({
      name: name,
      bio: bio,
      genres,
      image: imageUrl,
      isVerified: true,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Created Artist",
      data: createdArtist,
    });
  });

  export const editArtist = asyncHandler(async function editArtist(
    req: IExtendedRequest,
    res: Response,
    next: NextFunction
  ) {
    // required name, genres, isVerified

    const { name, bio, genres, isVerified } = req.body;
    const artistId = req.params.id;

    const artist = await Artist.findById(artistId);

    if (!artist) throw new AppError("No artist found", StatusCodes.NOT_FOUND);

    if (req.secure_url) artist.image = req.secure_url;

    artist.name = name || artist.name;
    artist.bio = bio || artist.bio;
    artist.genres = genres || artist.genres;
    artist.isVerified =
      isVerified !== artist.isVerified ? isVerified : artist.isVerified;

    const savedArtist = await artist.save();

    res.status(StatusCodes.OK).json({
      succes: true,
      message: "Artist updated successfully",
      data: savedArtist,
    });
  });

  export const deleteArtist = asyncHandler(async function deleteArtist(
    req: IExtendedRequest,
    res: Response
  ) {
    const artistId = req.params.id;

    if (!artistId) throw new AppError("Bad request", StatusCodes.BAD_REQUEST);

    const artist = await Artist.findByIdAndDelete(artistId);

    if (!artist) throw new AppError("No artist found", StatusCodes.NOT_FOUND);

    await Song.deleteMany({
      artist: artistId,
    });

    await Album.deleteMany({
      artist: artistId,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Artist Deleted",
    });
  });

  export const getArtist = asyncHandler(async function getArtist(
    req: IExtendedRequest,
    res: Response
  ) {
    const artistId = req.params.id;

    const artist = await Artist.findById(artistId).select("-password");

    if (!artist) throw new AppError("No artist found", StatusCodes.NOT_FOUND);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      data: artist,
    });
  });

  export const getArtists = asyncHandler(async function getArtists(
    req: IExtendedRequest,
    res: Response
  ) {
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);

    let filter: FilterQuery<typeof Artist> = {};

    if (req.query.genre) filter.genre = { $inc: [req.query.genre] };

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { bio: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const count = await Artist.countDocuments(filter);

    const skip = (page - 1) * limit;

    const artists = await Artist.find(filter)
      .sort({ followers: -1 })
      .limit(limit)
      .skip(skip);

    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: artists,
      page: page,
      pages: Math.ceil(count / limit),
      totalCount: count,
    });
  });

  export const getTopArtists = asyncHandler(async function getTopArtists(
    req: IExtendedRequest,
    res: Response
  ) {
    const limit = Number(req.query.limit);

    const artists = await Artist.find().limit(limit).sort({ followers: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      data: artists,
    });
  });

  export const getArtistTopSongs = asyncHandler(
    async function getArtistTopSongs(req: IExtendedRequest, res: Response) {
      const artistId = req.params.id;
      const limit = Number(req.query.limit);

      const topSongs = await Song.find({
        artist: artistId,
      })
        .sort({ plays: -1 })
        .limit(limit || 10)
        .populate("album", "title coverImage");

      if (topSongs.length > 0) {
        res.status(StatusCodes.OK).json({
          success: true,
          message: "Artists top songs", // TODO: need better message
          data: topSongs,
        });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "No Songs found", // TODO: need better message
          data: [],
        });
      }
    }
  );
}
