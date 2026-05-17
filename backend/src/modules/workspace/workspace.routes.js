import express from "express";

import { authMiddleWare } from "../../middleware/auth.middleware.js";
import { validateWorkspaceInput, validateWorkspaceResult, validateRole } from "./workspace.validator.js";
import {
    allUserWorkspaces, allWorkspaces, approve,
    deleteUserWorkspace, getMembership, join,
    leave, reject, remove,
    update, workspace, workspaceContent
} from "./workspace.controller.js";

const worksapceRouter = express.Router()

worksapceRouter.post("/", authMiddleWare, validateWorkspaceInput, validateWorkspaceResult, workspace);
worksapceRouter.get("/", authMiddleWare, allWorkspaces)
worksapceRouter.get("/me", authMiddleWare, allUserWorkspaces)
worksapceRouter.get("/:workspaceId", authMiddleWare, workspaceContent)
worksapceRouter.post("/:workspaceId/join", authMiddleWare, join)
worksapceRouter.get("/:workspaceId/members", authMiddleWare, getMembership)
worksapceRouter.patch("/:workspaceId/members/:targetUserId/approve", authMiddleWare, approve)
worksapceRouter.patch("/:workspaceId/members/:targetUserId/reject", authMiddleWare, reject)
worksapceRouter.patch("/:workspaceId/update", authMiddleWare, update)
worksapceRouter.delete("/:workspaceId/delete", authMiddleWare, deleteUserWorkspace)
worksapceRouter.patch("/:workspaceId/leave", authMiddleWare, leave)
worksapceRouter.patch("/:workspaceId/members/:targetUserId/remove", authMiddleWare, remove)
worksapceRouter.patch("/:workspaceId/members/:targetUserId/updateUser", authMiddleWare, validateRole, validateWorkspaceResult, remove)
export default worksapceRouter;

//