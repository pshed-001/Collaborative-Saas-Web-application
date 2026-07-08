import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import testRouter from "./routes/test.route.js";
import workspaceRouter from "./modules/workspace/workspace.routes.js";
import { errorhandler } from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import taskRouter from "./modules/task/task.routes.js";

const app = express();
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended : true}));
app.use("/auth", authRouter );
app.use("/test", testRouter);
app.use("/workspace", workspaceRouter);
app.use("/workspace/:workspaceId/tasks", taskRouter)
app.use(errorhandler);

export default app;