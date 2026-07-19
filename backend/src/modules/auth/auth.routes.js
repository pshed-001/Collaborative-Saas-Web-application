import express from "express";
import { validateRegisterUser, validateLogin, validateAuthResult } from "./auth.validator.js";
import { register, login, accessTokenGenerator, loggedOut } from "./auth.controller.js";

import * as loginLmt from "../../middleware/ratelimit/loginLimiter.js"
import * as registerLmt from "../../middleware/ratelimit/registerLimiter.js"
const authRouter = express.Router()

authRouter.post("/register", 
    registerLmt.registerSlowDown,registerLmt.registerLimiterCombined,
    registerLmt.registerLimiterByIp, registerLmt.registerLimiterByEmail,
    validateRegisterUser,validateAuthResult, register)

authRouter.post("/login", 
    loginLmt.loginSlowDown,loginLmt.loginLimiterCombined,
    loginLmt.loginLimiterByIp, loginLmt.loginLimiterByUserInput,
    validateLogin, validateAuthResult, login)

authRouter.post("/refresh", accessTokenGenerator)
authRouter.post("/logout", loggedOut)
export default authRouter

