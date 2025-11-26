import { ISong } from "../../interface/song.interface.js";

export type SongType = {
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioURL: string;
  coverImage?: string;
  releaseDate?: string;
  genre?: string;
  plays?: number;
  likes?: number;
  isExplicit?: boolean;
  featuredArtists?: string;
};

export type EditSong = Partial<SongType> & { song: string };

export type GetSongsQuery = {
  limit?: string;
  page?: string;
  search?: string;
};
