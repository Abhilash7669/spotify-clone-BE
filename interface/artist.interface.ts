import { Document, Schema, Types } from "mongoose";

export interface IArtist extends Document {
  name: string;
  bio?: string;
  image?: string;
  genres?: Array<Schema.Types.ObjectId>;
  followers?: number;
  songs?: Array<Types.ObjectId>;
  albums: Array<Schema.Types.ObjectId>;
  isVerified?: boolean;
}
