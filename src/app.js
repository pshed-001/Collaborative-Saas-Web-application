import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes.js";
import testRouter from "./routes/test.route.js";
import workspaceRouter from "./modules/workspace/workspace.routes.js";
import { errorhandler } from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import limiter from "./middleware/ratelimit/globalLimiter.js";
const app = express();

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(url => url.trim())
    : [];

//cors configuration
app.use(
    cors({
        origin: allowedOrigins,
        optionsSuccessStatus: 200,
        credentials: true,
        exposedHeaders: ["Authorization"],
    }),
);

// essential express resources needed
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// routes for application
// auth route
app.use("/auth", authRouter);
// test route
app.use("/test", testRouter);
// workspace route
app.use("/workspace", workspaceRouter);
// global error handler
app.use(errorhandler);

export default app;
