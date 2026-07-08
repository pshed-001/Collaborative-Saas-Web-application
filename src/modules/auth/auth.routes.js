import express from "express";
import { validateRegisterUser, validateLogin, validateAuthResult } from "./auth.validator.js";
import { register, login, accessTokenGenerator, loggedOut, updateUser } from "./auth.controller.js";

const authRouter = express.Router()
// authRouter.get("/update", updateUser)
authRouter.post("/register", validateRegisterUser,validateAuthResult,register)
authRouter.post("/login",validateLogin,validateAuthResult,login )
authRouter.post("/refresh", accessTokenGenerator )
authRouter.post("/logout", loggedOut)
export default authRouter;