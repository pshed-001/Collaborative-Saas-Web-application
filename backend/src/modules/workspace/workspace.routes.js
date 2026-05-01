import express from "express";
import { authMiddleWare } from "../../middleware/auth.middleware.js";
import { validateWorkspaceInput, validateWorkspaceResult } from "./workspace.validator.js";
import { workspace, allWorkspaces, allUserWorkspaces, workspaceContent, join, getMembership, approve } from "./workspace.controller.js";
const worksapceRouter = express.Router()

worksapceRouter.post("/", authMiddleWare, validateWorkspaceInput, validateWorkspaceResult,workspace);
worksapceRouter.get("/", authMiddleWare, allWorkspaces )
worksapceRouter.get("/me", authMiddleWare, allUserWorkspaces)
worksapceRouter.get("/:workspaceId",authMiddleWare, workspaceContent)
worksapceRouter.post("/:workspaceId/join", authMiddleWare, join)
worksapceRouter.get("/:workspaceId/members",authMiddleWare, getMembership)
worksapceRouter.patch("/:workspaceId/members/:targetUserId/approve", authMiddleWare, approve)
export default worksapceRouter;