import { Document, Schema } from "mongoose";

export interface ISong extends Document {
  title: string;
  artist: Schema.Types.ObjectId;
  album?: Schema.Types.ObjectId;
  duration: number;
  audioURL: string;
  coverImage?: string;
  releaseDate?: Date;
  genre?: string;
  plays?: number;
  likes?: number;
  isExplicit?: boolean;
  featuredArtists?: Array<Schema.Types.ObjectId>;
}
