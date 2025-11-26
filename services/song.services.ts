import { AppError } from "../utils/error/app-error.utils.js";
import { StatusCodes } from "http-status-codes";
import Song from "../models/song.model.js";
import Artist from "../models/artist.model.js";
import Playlist from "../models/playlist.model.js";
import User from "../models/user.model.js";
import Album from "../models/album.model.js";
import { EditSong, GetSongsQuery, SongType } from "../types/song/song.types.js";
import { FilterQuery, Types } from "mongoose";
import { LILLY_ARTIST_SERVICE } from "./artist.services.js";
import { IAlbum } from "../interface/album.interface.js";
import { LILLY_ALBUM_SERVICE } from "./album.services.js";
import { MulterFiles } from "../types/multer.types.js";
import { LILLY_SERVICE_CLOUDINARY } from "./cloudinary.services.js";
import { PaginatedResult } from "../types/common.type.js";
import { ISong } from "../interface/song.interface.js";
import { LILLY_SERVICE_USER } from "./user.services.js";

export namespace LILLY_SONG_SERVICE {
  export async function likeSong(data: {
    songId: string;
    userId: string;
  }): Promise<boolean> {
    const { songId, userId } = data;

    if (!songId) {
      throw new AppError("No song id found", StatusCodes.BAD_REQUEST);
    }

    const user = await LILLY_SERVICE_USER.getUserById(userId);

    const song = await LILLY_SONG_SERVICE.findSongById(songId);

    if (!song) {
      throw new AppError("Song not found", StatusCodes.NOT_FOUND);
    }

    const hasLiked = user.likedSongs.includes(song._id as Types.ObjectId);

    if (hasLiked) {
      throw new AppError(
        "User has already liked this song",
        StatusCodes.CONFLICT
      );
    }

    song.likes! += 1;

    await song.save();

    user.likedSongs.push(song._id as Types.ObjectId);

    await user.save();

    return true;
  }

  export async function unikeSong(data: {
    songId: string;
    userId: string;
  }): Promise<boolean> {
    const { userId, songId } = data;

    if (!songId) {
      throw new AppError("No song id found", StatusCodes.BAD_REQUEST);
    }

    const user = await LILLY_SERVICE_USER.getUserById(userId);

    const song = await LILLY_SONG_SERVICE.findSongById(songId);

    if (!song) {
      throw new AppError("Song not found", StatusCodes.NOT_FOUND);
    }

    song.likes! -= 1;

    await song.save();

    user.likedSongs = user.likedSongs.filter(
      (item) => item.toString() !== String(song._id)
    );

    await user.save();

    return true;
  }

  export async function getSong(
    songId: string,
    options?: {
      populate: Array<{ path: string; select: string }>;
    }
  ) {
    if (!songId) {
      throw new AppError("No song id found", StatusCodes.BAD_REQUEST);
    }

    const song = await LILLY_SONG_SERVICE.findSongById(songId);

    if (options?.populate?.length) {
      for (const populateInstruction of options.populate) {
        await song.populate(populateInstruction);
      }
    }
    song.plays! += 1;
    await song.save();
    return song;
  }

  export async function getSongs(
    query: GetSongsQuery
  ): Promise<PaginatedResult<ISong>> {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;

    const skip = (page - 1) * limit;

    let filter: FilterQuery<typeof Song> = {};

    if (query.search) filter.name = { $regex: query.search, $options: "i" };

    const count = await Song.countDocuments(filter); // count total document;

    const songs = await Song.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!songs || !count)
      throw new AppError("No songs found", StatusCodes.NOT_FOUND);

    return {
      data: songs,
      count: count,
      page: page,
      pages: Math.ceil(count / limit),
      itemsPerPage: songs.length,
    };
  }

  export async function findSongById(songId: string) {
    if (!songId)
      throw new AppError("No song id found", StatusCodes.BAD_REQUEST);

    const song = await Song.findById(songId);

    if (!song) {
      throw new AppError("Song not found", StatusCodes.NOT_FOUND);
    }

    return song;
  }

  export async function addSong(data: SongType) {
    const {
      artist,
      audioURL,
      duration,
      title,
      album,
      coverImage,
      featuredArtists,
      genre,
      isExplicit,
      releaseDate,
    } = data;

    if (!title || !audioURL || !duration || !artist) {
      throw new AppError(
        "Title, Audio URL, duration and artist are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const _aritst = await LILLY_ARTIST_SERVICE.getArtistById(artist);

    let _album: IAlbum | null = null;

    if (album) {
      _album = await LILLY_ALBUM_SERVICE.getAlbumById(album);
    }

    const song = await Song.create({
      title,
      artist,
      audioURL,
      duration,
      coverImage: coverImage,
      featuredArtists: featuredArtists ? JSON.parse(featuredArtists) : [],
      genre,
      isExplicit,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      album: _album?._id || null,
    });

    if (!song) {
      // HANDLE delete uploaded file later
      throw new AppError(
        "Error creating song",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    _aritst.songs?.push(song._id as Types.ObjectId);
    await _aritst.save();

    _album?.songs?.push(song._id as Types.ObjectId);
    await _album?.save();

    return song;
  }

  export async function editSong(
    songId: string,
    data: EditSong,
    files?: { [fieldname: string]: MulterFiles } | MulterFiles | undefined
  ) {
    if (!songId) {
      throw new AppError("No Song id found", StatusCodes.BAD_REQUEST);
    }
    const song = await LILLY_SONG_SERVICE.findSongById(songId);

    song.title = data.title || song.title;
    song.isExplicit =
      data.isExplicit !== undefined ? data.isExplicit : song.isExplicit;
    song.duration = data.duration || song.duration;
    song.genre = data.genre || song.genre;
    song.releaseDate = data.releaseDate
      ? new Date(data.releaseDate)
      : song.releaseDate;

    // cover image & audioUrl
    if (files) {
      const coverImage = (files as { coverImage?: MulterFiles })
        ?.coverImage?.[0];
      const _song = (files as { song?: MulterFiles })?.song?.[0];

      if (coverImage) {
        const _uploadCoverImage =
          await LILLY_SERVICE_CLOUDINARY.uploadCloudinary(coverImage.path, {
            folder: "coverImage",
          });

        if (!_uploadCoverImage) {
          throw new AppError(
            "Error uploading image",
            StatusCodes.INTERNAL_SERVER_ERROR
          );
        }

        song.coverImage = _uploadCoverImage.secure_url;
      }

      if (_song) {
        const _uploadSong = await LILLY_SERVICE_CLOUDINARY.uploadCloudinary(
          _song.path,
          { folder: "spotify/songs" }
        );

        if (!_uploadSong) {
          throw new AppError(
            "Error uploading song",
            StatusCodes.INTERNAL_SERVER_ERROR
          );
        }

        song.audioURL = _uploadSong.secure_url;
      }
    }

    await song.save();

    return song;

    // two reference scenarios (if aritst -> update artist flow, if album -> update album flow);
    // TODO: Re-think later how to handle artist and album update
  }

  export async function deleteSong(songId: string, artistId: string) {
    if (!songId) {
      throw new AppError("No song id found", StatusCodes.BAD_REQUEST);
    }

    const song = await LILLY_SONG_SERVICE.findSongById(songId);
    // removing songs from referenced fields
    await Artist.updateOne({ _id: artistId }, { $pull: { songs: song._id } }); // removing that one id from an array of id;

    await Playlist.updateOne(
      { songs: song._id },
      { $pull: { songs: song._id } }
    ); // removing one id from an array of id;

    await User.updateOne(
      { likedSongs: song._id },
      { $pull: { likedSongs: song._id } }
    ); // removing one id from an array of id;

    await Album.updateOne({ songs: song._id }, { $pull: { songs: song._id } }); // removing one id from an array of id;

    await song.deleteOne();
  }
}
