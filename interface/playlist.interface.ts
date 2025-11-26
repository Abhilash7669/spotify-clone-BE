import { Document, Schema } from "mongoose";

export interface IPlaylist extends Document {
  name: string;
  description?: string;
  coverImage?: string;
  creator: Schema.Types.ObjectId;
  songs?: Array<Schema.Types.ObjectId>;
  isPublic?: boolean;
  followers?: number;
  collaborators?: Array<Schema.Types.ObjectId>;
}
