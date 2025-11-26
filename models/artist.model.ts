import { model, Schema } from "mongoose";
import { IArtist } from "../interface/artist.interface.js";

const artistSchema = new Schema<IArtist>(
  {
    name: {
      type: String,
      required: [true, "Artist name is required"],
    },
    bio: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2019/09/27/07/57/music-4507819_1280.jpg",
    },
    songs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    genres: [
      {
        type: String,
        ref: "Song",
      },
    ],
    followers: {
      type: Number,
      default: 0,
    },
    albums: [
      {
        type: Schema.Types.ObjectId,
        ref: "Album",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Artist = model("Artist", artistSchema, "artist");

export default Artist;
