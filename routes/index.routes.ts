import { Router } from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.route.js";
import artistRouter from "./artist.routes.js";
import albumRouter from "./album.routes.js";
import songsRouter from "./songs.routes.js";
import playlistRouter from "./playlist.routes.js";

const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/users", userRouter);
v1Router.use("/artists", artistRouter);
v1Router.use("/albums", albumRouter);
v1Router.use("/songs", songsRouter);
v1Router.use("/playlists", playlistRouter);

export default v1Router;
