import asyncHandler from "express-async-handler";
import { IExtendedRequest } from "../interface/auth.interface.js";
import { Response } from "express";
import Album from "../models/album.model.js";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/error/app-error.utils.js";
import Artist from "../models/artist.model.js";
import { FilterQuery, Schema } from "mongoose";
import Song from "../models/song.model.js";
/**
 * create album - route done - done
 * get album by id - route done - done
 * get albums - route done - done (combined, all albums random. all albums with artist id)
 * get recently added albums - route done - done
 * update album - route done - done
 * delete album - route done - done
 * add songs to album - done
 * remove songs from album - done
 */

export namespace LILLY_ALBUM_CONTROLLER {
  export const getAlbums = asyncHandler(async function getAlbums(
    req: IExtendedRequest,
    res: Response
  ) {
    const { artistId, search, page, limit, genre, isExplicit } = req.query;

    let filter: FilterQuery<typeof Album> = {};

    const _page = page ? Number(page) : 1;
    const _limit = limit ? Number(limit) : 10;

    if (genre) filter.genre = genre;

    if (search) filter.name = { $regex: search, $options: "i" };

    if (isExplicit !== undefined || isExplicit !== null)
      filter.isExplicit = isExplicit;

    if (artistId) filter.artist = artistId;

    const count = await Album.countDocuments(filter);

    const skip = (_page - 1) * _limit;

    console.log(filter, "FILTER HIT: 0");

    const albums = await Album.find(filter)
      .sort({ releaseDate: -1 })
      .skip(skip)
      .limit(_limit)
      .populate("artist", "name image");

    console.log(albums, "ALBUMS HIT: A");

    if (!albums || albums.length === 0)
      throw new AppError("No Albums found", StatusCodes.NOT_FOUND);
    console.log(albums, "ALBUMS HIT: B");

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully fetched data", // TODO: Better message
      data: albums,
      count: count,
      page: _page,
      pages: Math.ceil(count / _limit),
    });
  });

  export const getAlbumById = asyncHandler(async function getAlbumById(
    req: IExtendedRequest,
    res: Response
  ) {
    const albumId = req.params.id;
    if (!albumId)
      throw new AppError("No album id found", StatusCodes.BAD_REQUEST);

    const album = await Album.findById(albumId).populate(
      "artist",
      "name image"
    );

    if (!album) throw new AppError("Album not found", StatusCodes.NOT_FOUND);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Fetched album successfully", // TODO: Better message
      data: album,
    });
  });

  export const getRecentlyAddedAlbums = asyncHandler(
    async function getRecentlyAddedAlbums(
      req: IExtendedRequest,
      res: Response
    ) {
      const { artistId, limit } = req.query;

      const _limit = limit ? Number(limit) : 5;

      let filter: FilterQuery<typeof Album> = {};

      if (artistId) filter.artist = artistId;

      const recentAlbums = await Album.find(filter)
        .sort({ releaseDate: -1 })
        .limit(_limit)
        .populate("artist", "name image");

      if (!recentAlbums)
        throw new AppError("No Recent Albums found", StatusCodes.NOT_FOUND);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Successfully fetched recent albums", // TODO: Better message
        data: recentAlbums,
        count: _limit,
      });
    }
  );

  export const createAlbum = asyncHandler(async function createAlbum(
    req: IExtendedRequest,
    res: Response
  ) {
    const {
      title,
      artistId,
      releaseDate,
      songs,
      genre,
      description,
      isExplicit,
    } = req.body;

    const coverImage = req.secure_url;

    // first defensive checks
    if (!title)
      throw new AppError("Album title is required", StatusCodes.BAD_REQUEST);
    if (!artistId)
      throw new AppError("Artist is required", StatusCodes.BAD_REQUEST);

    // check if artist exists
    const artist = await Artist.findById(artistId);

    if (!artist) throw new AppError("Artist not found", StatusCodes.NOT_FOUND);

    const albumExists = await Album.findOne({ title });
    if (albumExists)
      throw new AppError("Album already exists", StatusCodes.CONFLICT);

    const album = await Album.create({
      title,
      artist: artistId,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      songs,
      genre,
      description,
      isExplicit: isExplicit === "true",
      coverImage: coverImage ? coverImage : undefined,
    });

    artist.albums.push(album._id as Schema.Types.ObjectId);

    await artist.save();

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Created album successfully",
      data: album,
    });
  });

  export const editAlbum = asyncHandler(async function editAlbum(
    req: IExtendedRequest,
    res: Response
  ) {
    const albumId = req.params.id;
    const coverImage = req.secure_url;
    const {
      title,
      artistId,
      releaseDate,
      songs,
      genre,
      description,
      isExplicit,
    } = req.body;
    if (!albumId)
      throw new AppError("No album id found", StatusCodes.BAD_REQUEST);

    if (!title || !artistId)
      throw new AppError(
        "Title and Artist is required",
        StatusCodes.BAD_REQUEST
      );

    const album = await Album.findById(albumId);

    if (!album) throw new AppError("Album not found", StatusCodes.NOT_FOUND);

    album.title = title || album.title;
    album.artist = artistId || album.artist;
    album.releaseDate = new Date(releaseDate) || album.releaseDate;
    album.songs = songs && songs.length > 0 ? songs : album.songs;
    album.genre = genre || album.genre;
    album.description = description || album.description;
    album.isExplicit =
      isExplicit !== undefined || isExplicit !== null
        ? isExplicit
        : album.isExplicit;
    album.coverImage = coverImage || album.coverImage;

    const updatedAlbum = (await album.save()).populate("artist", "name image");

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully edited album", // TODO: Better message
      data: updatedAlbum,
    });
  });

  export const deleteAlbum = asyncHandler(async function deleteAlbum(
    req: IExtendedRequest,
    res: Response
  ) {
    const albumId = req.params.id;

    if (!albumId)
      throw new AppError("Album id not found", StatusCodes.BAD_REQUEST);

    // defensive checks

    // check if album exists
    const album = await Album.findById(albumId);

    if (!album) throw new AppError("Album not found", StatusCodes.NOT_FOUND);

    // update albums in refered documents
    // artist, songs
    await Artist.updateOne(
      { albums: album._id },
      { $pull: { albums: album._id } }
    );

    await Song.updateMany({ album: album._id }, { $unset: { album: 1 } });

    await album.deleteOne();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully deleted album",
    });
  });

  export const addSongsToAlbum = asyncHandler(async function addSongsToAlbum(
    req: IExtendedRequest,
    res: Response
  ) {
    const albumId = req.params.id;
    const { songs } = req.body;

    if (!albumId)
      throw new AppError("Album id not found", StatusCodes.BAD_REQUEST);

    const album = await Album.findById(albumId);

    if (!album) throw new AppError("Album not found", StatusCodes.NOT_FOUND);

    album.songs?.push(...songs);

    const updatedAlbum = await album.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully added",
      data: updatedAlbum,
    });
  });

  export const removeSongsFromAlbum = asyncHandler(
    async function removeSongsFromAlbum(req: IExtendedRequest, res: Response) {
      const albumId = req.params.id;

      if (!albumId)
        throw new AppError("No Album id found", StatusCodes.BAD_REQUEST);

      const { songs } = req.body;

      if (!Array.isArray(songs) || songs.length === 0)
        throw new AppError("Song is required", StatusCodes.BAD_REQUEST);

      const updatedAlbum = await Album.findByIdAndUpdate(
        albumId,
        { $pull: { songs: { $in: songs } } },
        { new: true }
      );

      if (!updatedAlbum)
        throw new AppError("No album found", StatusCodes.NOT_FOUND);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Successfully removed", // TODO: Better message
        data: updatedAlbum,
      });
    }
  );
}
