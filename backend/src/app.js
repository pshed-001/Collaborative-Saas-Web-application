import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import { errorhandler } from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";

const app= express();
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended : true}));
app.use("/auth", authRouter );
app.use(errorhandler);

export default app;