import { Router } from "express";
import { LILLY_AUTH_CONTROLLER } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", LILLY_AUTH_CONTROLLER.authLogin);
authRouter.post("/sign-up", LILLY_AUTH_CONTROLLER.authSignUp);

export default authRouter;
