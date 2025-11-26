import { Router } from "express";
import { LILLY_MULTER } from "../services/multer.services.js";
import { LILLY_PLAYLIST_CONTROLLER } from "../controller/playlist.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const playlistRouter = Router();

/**
 * create playlist - route done - controller & service done
 * get playlist - route done - controller & service done
 * get playlists - route done - controller & service done
 * delete playlist - route done - controller & service done
 * get user's playlist - route done - controller & service done
 * add songs to playlist - route done - controller & service done
 * remove song from playlist - route done - controller & service done
 * update playlist - route done - controller & service done
 * add collaborator to playlist - route done - controller & service done
 * remove collaborator to playlist - route done - controller & service done
 * get featured playlist - route done - controller & service done
 */

/**
 * @desc Create Playlist
 * @route Post /api/v1/playlists/create
 * @access Public
 */
playlistRouter.post(
  "/create",
  authMiddleware,
  LILLY_MULTER.multerStorage().single("coverImage"),
  LILLY_PLAYLIST_CONTROLLER.createPlaylist
);

/**
 * @desc Add Collaborators to playlist
 * @route Put /api/v1/playlists/:id/collaborators/add
 * @access Public
 */
playlistRouter.put(
  "/:id/collaborators/add",
  authMiddleware,
  LILLY_PLAYLIST_CONTROLLER.addCollaboratorsToPlaylist
);

/**
 * @desc Remove Collaborators to playlist
 * @route Put /api/v1/playlists/:id/collaborators/remove
 * @access Public
 */
playlistRouter.put(
  "/:id/collaborators/remove",
  authMiddleware,
  LILLY_PLAYLIST_CONTROLLER.removeCollaboratorsToPlaylist
);

/**
 * @desc Add songs to playlist
 * @route Put /api/v1/playlists/:id/songs/add
 * @access Public
 */
playlistRouter.put(
  "/:id/songs/add",
  authMiddleware,
  LILLY_PLAYLIST_CONTROLLER.addSongsToPlaylist
);

/**
 * @desc Add songs to playlist
 * @route Put /api/v1/playlists/:id/songs/remove
 * @access Public
 */
playlistRouter.put(
  "/:id/songs/remove",
  authMiddleware,
  LILLY_PLAYLIST_CONTROLLER.removeSongsFromPlaylist
);

/**
 * @desc Update Playlist
 * @route Put /api/v1/playlists/:id
 * @access Public
 */
playlistRouter.put(
  "/:id",
  authMiddleware,
  LILLY_PLAYLIST_CONTROLLER.editPlaylist
);

/**
 * @desc Get User's Playlists
 * @route Get /api/v1/playlists/me?limit=10&page=1&search=playlist_name
 * @access Public
 */
playlistRouter.get(
  "/me",
  authMiddleware,
  LILLY_PLAYLIST_CONTROLLER.getUsersPlaylist
);

/**
 * @desc Get Featured Playlists
 * @route Get /api/v1/playlists/featured?limit=10&page=1&search=playlist_name
 * @access Public
 */
playlistRouter.get(
  "/featured",
  authMiddleware,
  LILLY_PLAYLIST_CONTROLLER.getFeaturedPlaylist
);

/**
 * @desc Get Playlist
 * @route Get /api/v1/playlists/:id
 * @access Public
 */
playlistRouter.get(
  "/:id",
  authMiddleware,
  LILLY_PLAYLIST_CONTROLLER.getPlaylist
);

/**
 * @desc Get Playlists
 * @route Get /api/v1/playlists?limit=10&page=1&search=playlist_name
 * @access Public
 */
playlistRouter.get("/", authMiddleware, LILLY_PLAYLIST_CONTROLLER.getPlaylists);

/**
 * @desc Delete Playlists
 * @route Delete /api/v1/playlists/:id
 * @access Public
 */
playlistRouter.delete(
  "/:id",
  authMiddleware,
  LILLY_PLAYLIST_CONTROLLER.deletePlaylist
);

export default playlistRouter;
