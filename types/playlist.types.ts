export type CreatePlaylistBody = {
  name: string;
  creator: string;
  description?: string;
  isPublic?: boolean;
  followers?: number;
  songs?: string;
  collaborators?: string;
};

export type GetPlaylistsQuery = {
  limit?: string;
  page?: string;
  search?: string;
};

export type GetAddSongsToPlaylist = {
  playlistId: string;
  songs: Array<string>;
};

export type GetEditPlaylist = {
  playlistId: string;
  name: string;
  description: string;
  isPublic: boolean;
};
