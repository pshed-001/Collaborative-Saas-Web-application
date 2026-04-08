import express from "express";
import { validateRegisterUser, validateLogin, validateAuthResult } from "./auth.validator.js";
import { register, login } from "./auth.controller.js";

const authRouter = express.Router()
authRouter.post("/register", validateRegisterUser,validateAuthResult,register)

authRouter.post("/login",validateLogin,validateAuthResult,login )

export default authRouter;