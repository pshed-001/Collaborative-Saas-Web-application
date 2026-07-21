import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path"
import { fileURLToPath } from "node:url";
import helmet from "helmet"

import authRouter from "./modules/auth/auth.routes.js";
import testRouter from "./routes/test.route.js";
import workspaceRouter from "./modules/workspace/workspace.routes.js";

import { errorhandler } from "./middleware/error.middleware.js";
import { globalSlowDown, globalLimiter } from "./middleware/ratelimit/globalLimiter.js"

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(url => url.trim())
    : [];
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express();

// helmet config
app.use(helmet())
// in other not to rate limit the cdn
app.set('trust proxy', 1)
//cors configuration
app.use(
    cors({
        origin: allowedOrigins,
        optionsSuccessStatus: 200,
        credentials: true,
        exposedHeaders: ["Authorization"],
    }),
);
app.use(express.static(path.join(__dirname, "../../client_side/dist")))
// essential express resources needed
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(globalSlowDown) //global slowdown
app.use(globalLimiter)  // Global rate limit



// routes for application
// auth route
app.use("/api/auth", authRouter);
app.use("/api/test", testRouter);
app.use("/api/workspace", workspaceRouter);
app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client_side/index.html"))
})


app.use(errorhandler);

export default app;
