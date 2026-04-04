import express from "express";
import { validateRegisterUser, validateUserResult } from "./auth.validator.js";
import { register } from "./auth.controller.js";

const router = express.Router()
router.post("/", validateRegisterUser,validateUserResult,register)
export default router;