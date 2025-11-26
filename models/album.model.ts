import { model, Schema, Types } from "mongoose";
import { IAlbum } from "../interface/album.interface.js";

const albumSchema = new Schema<IAlbum>(
  {
    title: {
      type: String,
      required: [true, "Album title is required"],
      trim: true,
    },
    artist: {
      type: Schema.Types.ObjectId,
      required: [true, "Artist is required"],
      ref: "Artist",
    },
    releaseDate: {
      type: Date,
      default: Date.now(),
    },
    coverImage: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2025/10/12/16/36/sunset-glow-9890310_1280.jpg",
    },
    songs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    genre: {
      type: String,
      trim: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    isExplicit: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Album = model("Album", albumSchema, "album");

export default Album;
