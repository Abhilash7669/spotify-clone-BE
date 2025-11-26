import { Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
  isAdmin?: boolean;
  likedSongs: Array<Types.ObjectId>;
  likedAlbums: Array<Types.ObjectId>;
  followedArtist: Array<Types.ObjectId>;
  followedPlaylist: Array<Types.ObjectId>;
}
