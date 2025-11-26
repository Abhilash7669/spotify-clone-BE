import { model, Schema, Types } from "mongoose";
import { IUser } from "../interface/user.interface.js";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Minimum of 6 characters required"],
    },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2023/04/27/10/22/cat-7954262_1280.jpg",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    likedSongs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    likedAlbums: [
      {
        type: Schema.Types.ObjectId,
        ref: "Album",
      },
    ],
    followedArtist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
      },
    ],
    followedPlaylist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema, "user");

export default User;
