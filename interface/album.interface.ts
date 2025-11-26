import { Document, Types } from "mongoose";

export interface IAlbum extends Document {
  title: string;
  artist: Types.ObjectId;
  releaseDate?: Date;
  coverImage?: string;
  songs?: Array<Types.ObjectId>;
  genre?: string;
  likes?: number;
  description?: string;
  isExplicit?: boolean;
}
