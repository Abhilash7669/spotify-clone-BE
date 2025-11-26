import asyncHandler from "express-async-handler";
import { IExtendedRequest } from "../interface/auth.interface.js";
import { Response } from "express";
import {
  CreatePlaylistBody,
  GetAddSongsToPlaylist,
  GetEditPlaylist,
  GetPlaylistsQuery,
} from "../types/playlist.types.js";
import { LILLY_PLAYLIST_SERVICE } from "../services/playlist.services.js";
import { StatusCodes } from "http-status-codes";

export namespace LILLY_PLAYLIST_CONTROLLER {
  export const createPlaylist = asyncHandler(async function createSong(
    req: IExtendedRequest,
    res: Response
  ) {
    const { name, description, songs, isPublic, collaborators, followers } =
      req.body;

    const creator = req.userId as string;

    const data: CreatePlaylistBody = {
      name,
      description,
      isPublic,
      songs,
      collaborators,
      followers,
      creator,
    };

    const playlist = await LILLY_PLAYLIST_SERVICE.createPlaylist(
      data,
      req.files
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Playlist created successfully",
      data: playlist,
    });
  });

  export const addCollaboratorsToPlaylist = asyncHandler(
    async function addCollaboratorsToPlaylist(
      req: IExtendedRequest,
      res: Response
    ) {
      const userId = req.userId;
      const playlistId = req.params.id;

      const { collaborators } = req.body;

      const data = {
        userId: userId as string,
        playlistId: playlistId as string,
        collaborators: collaborators as Array<string>,
      };

      const updatedPlaylist =
        await LILLY_PLAYLIST_SERVICE.addCollaboratorsToPlaylist(data);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Added collaborators",
        data: updatedPlaylist,
      });
    }
  );

  export const removeCollaboratorsToPlaylist = asyncHandler(
    async function removeCollaboratorsToPlaylist(
      req: IExtendedRequest,
      res: Response
    ) {
      const playlistId = req.params.id;
      const userId = req.userId;

      const { collaborators } = req.body;

      const data = {
        playlistId: playlistId as string,
        userId: userId as string,
        collaborators: collaborators as Array<string>,
      };

      const updatedPlaylist =
        await LILLY_PLAYLIST_SERVICE.removeCollaboratorsToPlaylist(data);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Removed Collaborators",
        data: updatedPlaylist,
      });
    }
  );

  export const getFeaturedPlaylist = asyncHandler(
    async function getFeaturedPlaylist(req: IExtendedRequest, res: Response) {
      const { limit, search, page } = req.query;

      const data = {
        limit: limit as string,
        search: search as string,
        page: page as string,
      };

      const featuredPlaylist = await LILLY_PLAYLIST_SERVICE.getFeaturedPlaylist(
        data
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Fetched featured playlist", // todo: better message
        ...featuredPlaylist,
      });
    }
  );

  export const addSongsToPlaylist = asyncHandler(
    async function addSongsToPlaylist(req: IExtendedRequest, res: Response) {
      const playlistId = req.params.id;

      const { songs } = req.body;

      const data: GetAddSongsToPlaylist = {
        playlistId,
        songs,
      };

      await LILLY_PLAYLIST_SERVICE.addSongsToPlaylist(data);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Added songs to playlist",
      });
    }
  );

  export const removeSongsFromPlaylist = asyncHandler(
    async function removeSongsFromPlaylist(
      req: IExtendedRequest,
      res: Response
    ) {
      const playlistId = req.params.id;
      const { songs } = req.body;

      const data: GetAddSongsToPlaylist = {
        playlistId,
        songs,
      };

      await LILLY_PLAYLIST_SERVICE.removeSongsFromPlaylist(data);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Songs removed from playlist successfully",
      });
    }
  );

  export const editPlaylist = asyncHandler(async function editPlaylist(
    req: IExtendedRequest,
    res: Response
  ) {
    const playlistId = req.params.id;
    const { name, description, isPublic } = req.body;

    const data: GetEditPlaylist = {
      playlistId,
      description,
      isPublic,
      name,
    };

    const editedPlaylist = await LILLY_PLAYLIST_SERVICE.editPlaylist(data);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully updated playlist",
      data: editedPlaylist,
    });
  });

  export const getPlaylist = asyncHandler(async function getPlaylist(
    req: IExtendedRequest,
    res: Response
  ) {
    const playlistId = req.params.id;

    const playlist = await LILLY_PLAYLIST_SERVICE.getPlaylist(playlistId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Fetched Playlist", // todo: better message
      data: playlist,
    });
  });

  export const getPlaylists = asyncHandler(async function getPlaylists(
    req: IExtendedRequest,
    res: Response
  ) {
    const { search, limit, page } = req.query;

    const queryData: GetPlaylistsQuery = {
      limit: limit as string,
      page: page as string,
      search: search as string,
    };

    const playlists = await LILLY_PLAYLIST_SERVICE.getPlaylists(queryData);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Fetched playlists", // todo: better message
      ...playlists,
    });
  });

  export const getUsersPlaylist = asyncHandler(async function getUsersPlaylist(
    req: IExtendedRequest,
    res: Response
  ) {
    const { limit, page, search } = req.query;

    const data: GetPlaylistsQuery = {
      limit: limit as string,
      page: page as string,
      search: search as string,
    };

    const userId = req.userId;

    const usersPlaylist = await LILLY_PLAYLIST_SERVICE.getUsersPlaylist(
      data,
      userId as string
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Fetched playlist", // todo: better message
      ...usersPlaylist,
    });
  });

  export const deletePlaylist = asyncHandler(async function deletePlaylist(
    req: IExtendedRequest,
    res: Response
  ) {
    const playlistId = req.params.id;
    const creator = req.userId;

    const data: { playlistId: string; creator: string } = {
      playlistId,
      creator: creator as string,
    };

    await LILLY_PLAYLIST_SERVICE.deletePlaylist(data);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Deleted Playlist Successfully",
    });
  });
}
