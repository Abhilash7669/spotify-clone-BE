import { StatusCodes } from "http-status-codes";
import {
  CreatePlaylistBody,
  GetAddSongsToPlaylist,
  GetEditPlaylist,
  GetPlaylistsQuery,
} from "../types/playlist.types.js";
import { AppError } from "../utils/error/app-error.utils.js";
import Playlist from "../models/playlist.model.js";
import { MulterFiles, UploadedFiles } from "../types/multer.types.js";
import { LILLY_SERVICE_CLOUDINARY } from "./cloudinary.services.js";
import { IPlaylist } from "../interface/playlist.interface.js";
import { FilterQuery, Schema, Types } from "mongoose";
import { PaginatedResult } from "../types/common.type.js";
import User from "../models/user.model.js";

export namespace LILLY_PLAYLIST_SERVICE {
  export async function createPlaylist(
    data: CreatePlaylistBody,
    uploadedFiles?: UploadedFiles
  ): Promise<IPlaylist> {
    if (!data.name) {
      throw new AppError("Playlist name is required", StatusCodes.BAD_REQUEST);
    }

    if (!data.creator) {
      throw new AppError("Creator is required", StatusCodes.BAD_REQUEST);
    }

    const playlistExists = await Playlist.findOne({ name: data.name });

    if (playlistExists) {
      throw new AppError("Play list already exists", StatusCodes.CONFLICT);
    }

    let _coverImageSecureUrl: string | null = null;

    if (uploadedFiles) {
      const _coverImage = (uploadedFiles as { coverImage?: MulterFiles })
        ?.coverImage?.[0];

      if (_coverImage) {
        const result = await LILLY_SERVICE_CLOUDINARY.uploadCloudinary(
          _coverImage.path,
          { folder: "playlist/coverImage" }
        );

        if (result) _coverImageSecureUrl = result.secure_url;
      }
    }

    const playlist = await Playlist.create({
      name: data.name,
      description: data.description,
      creator: data.creator,
      followers: data.followers,
      songs: data.songs ? JSON.parse(data.songs) : [],
      isPublic: data.isPublic,
      collaborators: data.collaborators ? JSON.parse(data.collaborators) : [],
      coverImage: _coverImageSecureUrl,
    });

    if (!playlist) {
      throw new AppError(
        "Could not create playlist",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return playlist;
  }

  export async function addSongsToPlaylist(
    data: GetAddSongsToPlaylist
  ): Promise<boolean> {
    const { playlistId, songs } = data;

    if (!playlistId) {
      throw new AppError("No playlist id found", StatusCodes.BAD_REQUEST);
    }

    if (!songs || songs.length === 0) {
      throw new AppError("Songs are required", StatusCodes.BAD_REQUEST);
    }

    const playlist = await LILLY_PLAYLIST_SERVICE.getPlaylistById(playlistId);

    playlist.songs = songs as unknown as Array<Schema.Types.ObjectId>;

    await playlist.save();

    return true;
  }

  export async function removeSongsFromPlaylist(data: GetAddSongsToPlaylist) {
    const { playlistId, songs } = data;

    if (!playlistId) {
      throw new AppError("No playlist id found", StatusCodes.BAD_REQUEST);
    }

    if (!songs || songs.length === 0) {
      throw new AppError("Songs are required", StatusCodes.BAD_REQUEST);
    }

    await Playlist.updateOne(
      { _id: playlistId },
      { $pull: { songs: { $in: songs } } }
    );
  }

  export async function editPlaylist(
    data: GetEditPlaylist
  ): Promise<IPlaylist> {
    const { description, isPublic, name, playlistId } = data;

    if (!playlistId) {
      throw new AppError("Playlist id is required", StatusCodes.BAD_REQUEST);
    }

    if (
      isPublic === undefined ||
      !description ||
      description.trim() === "" ||
      !name ||
      name.trim() === ""
    ) {
      throw new AppError("Payload cannot be empty", StatusCodes.BAD_REQUEST); // todo: better error message
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { _id: playlistId },
      { isPublic: isPublic, name, description },
      { new: true }
    );

    if (!updatedPlaylist) {
      throw new AppError(
        "Could not update playlist",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return updatedPlaylist.populate("creator", "name profilePicture");
  }

  export async function addCollaboratorsToPlaylist(data: {
    userId: string;
    playlistId: string;
    collaborators: Array<string>;
  }): Promise<IPlaylist> {
    const { playlistId, userId, collaborators } = data;

    if (!playlistId) {
      throw new AppError("Playlist id not found", StatusCodes.BAD_REQUEST);
    }

    if (!Array.isArray(collaborators) || collaborators.length === 0) {
      throw new AppError("Collaborators is required", StatusCodes.BAD_REQUEST);
    }

    const _collaborators = await User.find({ _id: { $in: collaborators } });

    if (!_collaborators || _collaborators.length === 0) {
      throw new AppError("Collaborators not found", StatusCodes.NOT_FOUND);
    }

    const playlist = await LILLY_PLAYLIST_SERVICE.getPlaylistById(playlistId);

    if (String(playlist.creator) !== userId) {
      throw new AppError(
        "Not Authorized to add collaborators",
        StatusCodes.FORBIDDEN
      );
    }

    playlist.collaborators =
      collaborators as unknown as Array<Schema.Types.ObjectId>;

    await playlist.save();

    return playlist;
  }

  export async function removeCollaboratorsToPlaylist(data: {
    userId: string;
    playlistId: string;
    collaborators: Array<string>;
  }): Promise<IPlaylist> {
    const { collaborators, playlistId, userId } = data;

    if (!playlistId) {
      throw new AppError("Playlist id not found", StatusCodes.BAD_REQUEST);
    }

    if (!Array.isArray(collaborators) || collaborators.length === 0) {
      throw new AppError("Collaborators is required", StatusCodes.BAD_REQUEST);
    }

    const _collaborators = await User.find({ _id: { $in: collaborators } });

    if (!_collaborators || _collaborators.length === 0) {
      throw new AppError("Collaborators not found", StatusCodes.NOT_FOUND);
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { _id: playlistId, creator: userId },
      { $pull: { collaborators: { $in: collaborators } } },
      { new: true }
    );

    if (!updatedPlaylist) {
      throw new AppError("Error Updating", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return updatedPlaylist;
  }

  export async function getFeaturedPlaylist(data: {
    limit: string;
    page: string;
    search: string;
  }): Promise<PaginatedResult<IPlaylist>> {
    const { limit, page, search } = data;

    const _limit = limit ? Number(limit) : 10;
    const _page = page ? Number(page) : 1;
    const _skip = (_page - 1) * _limit;

    let filter: FilterQuery<typeof Playlist> = { isPublic: true };

    if (search) filter.name = { $regex: search, $options: "i" };

    const featuredPlaylist = await Playlist.find(filter)
      .sort({ followers: -1 })
      .skip(_skip)
      .limit(_limit);

    if (!featuredPlaylist) {
      throw new AppError("No featured playlist found", StatusCodes.NOT_FOUND);
    }

    const count = await Playlist.countDocuments(filter);

    return {
      count: count,
      data: featuredPlaylist,
      itemsPerPage: featuredPlaylist.length,
      page: _page,
      pages: Math.ceil(count / _limit),
    };
  }

  export async function getPlaylistById(
    playlistId: string
  ): Promise<IPlaylist> {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new AppError("Playlist not found", StatusCodes.NOT_FOUND);
    }

    return playlist;
  }

  export async function getPlaylist(playlistId: string): Promise<IPlaylist> {
    if (!playlistId) {
      throw new AppError("No playlist id found", StatusCodes.BAD_REQUEST);
    }

    // find playlist
    let playlist = await LILLY_PLAYLIST_SERVICE.getPlaylistById(playlistId);

    playlist = await playlist.populate(["songs", "collaborators"]);

    return playlist;
  }

  export async function getPlaylists(
    queryData: GetPlaylistsQuery
  ): Promise<PaginatedResult<IPlaylist>> {
    const { limit, page, search } = queryData;

    const _limit = limit ? Number(limit) : 10;
    const _page = page ? Number(page) : 1;
    const _skip = (_page - 1) * _limit;

    let filter: FilterQuery<typeof Playlist> = { isPublic: true };

    if (search) filter.name = { $regex: search, $options: "i" };

    const count = await Playlist.countDocuments(filter);

    const playlists = await Playlist.find(filter)
      .skip(_skip)
      .limit(_limit)
      .populate("creator", "name profilePicture")
      .populate("collaborators", "name profilePicture");

    if (!playlists) {
      throw new AppError("No playlists found", StatusCodes.NOT_FOUND);
    }

    return {
      data: playlists,
      count: count,
      page: _page,
      pages: count / _limit,
      itemsPerPage: playlists.length,
    };
  }

  export async function getUsersPlaylist(
    data: GetPlaylistsQuery,
    userId: string
  ): Promise<PaginatedResult<IPlaylist>> {
    const { limit, page, search } = data;

    const _limit = limit ? Number(limit) : 10;
    const _page = page ? Number(page) : 1;
    const _skip = (_page - 1) * _limit;

    let filter: FilterQuery<typeof Playlist> = {
      $or: [{ creator: userId }, { collaborators: userId }],
    };

    if (search) filter.name = { $regex: search, $options: "i" };

    const usersPlaylist = await Playlist.find(filter)
      .sort({ createdAt: -1 })
      .skip(_skip)
      .limit(_limit);

    if (!usersPlaylist) {
      throw new AppError("No playlists found", StatusCodes.NOT_FOUND);
    }

    const count = await Playlist.countDocuments(filter);

    return {
      data: usersPlaylist,
      count: count,
      itemsPerPage: usersPlaylist.length,
      page: _page,
      pages: Math.ceil(count / _limit),
    };
  }

  export async function deletePlaylist(data: {
    playlistId: string;
    creator: string;
  }): Promise<boolean> {
    if (!data.playlistId) {
      throw new AppError("No playlist id found", StatusCodes.BAD_REQUEST);
    }

    const playlist = await LILLY_PLAYLIST_SERVICE.getPlaylistById(
      data.playlistId
    );

    if (String(playlist.creator) !== data.creator) {
      throw new AppError(
        "Unauthorized to delete playlist",
        StatusCodes.FORBIDDEN
      );
    }

    const deletedPlaylist = await Playlist.findOneAndDelete({
      _id: data.playlistId,
      creator: data.creator,
    });

    if (!deletedPlaylist) {
      throw new AppError(
        "Error in deleting playlist",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return true;
  }
}
