import { model, Schema } from "mongoose";
import { IPlaylist } from "../interface/playlist.interface.js";

const playListSchema = new Schema<IPlaylist>(
  {
    name: {
      type: String,
      required: [true, "Playlist name is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2025/10/17/12/07/bird-9900094_1280.jpg",
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    songs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    followers: {
      type: Number,
      default: 0,
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

playListSchema.pre("findOneAndDelete", async function (next) {
  console.log("I AM THE PRE MIDDLEWARE");
  next();
});

const Playlist = model("Playlist", playListSchema, "playlist");

export default Playlist;
