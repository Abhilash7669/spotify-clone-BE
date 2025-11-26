import { model, Schema } from "mongoose";
import { ISong } from "../interface/song.interface.js";

const songSchema = new Schema<ISong>(
  {
    title: {
      type: String,
      required: [true, "Song title is required"],
    },
    artist: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: [true, "Artist is required"],
    },
    album: {
      type: Schema.Types.ObjectId,
      ref: "Album",
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
    },
    audioURL: {
      type: String,
      required: [true, "Audio URL is required"],
    },
    coverImage: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2025/10/09/14/30/tajikistan-9883716_1280.jpg",
    },
    releaseDate: {
      type: Date,
      default: Date.now(),
    },
    genre: {
      type: String,
    },
    plays: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isExplicit: {
      type: Boolean,
      default: false,
    },
    featuredArtists: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Song = model("Song", songSchema, "song");

export default Song;
