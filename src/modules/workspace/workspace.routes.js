import express from "express";

import { authMiddleWare } from "../../middleware/auth.middleware.js";
import { validateWorkspaceInput, validateWorkspaceResult, validateRole, validateWorkspaceUpdateInput } from "./workspace.validator.js";
import {
    allUserWorkspaces, allWorkspaces, approve,
    deleteUserWorkspace, delUserWorkspacePermanently, getMembership, join,
    leave, recover, reject, remove,
    update, updateUserRole, userTrash, workspace,
    workspaceContent
} from "./workspace.controller.js";

const workspaceRouter = express.Router()

workspaceRouter.post("/", authMiddleWare, validateWorkspaceInput, validateWorkspaceResult, workspace);
workspaceRouter.get("/", authMiddleWare, allWorkspaces)
workspaceRouter.get("/me", authMiddleWare, allUserWorkspaces)
workspaceRouter.get("/:workspaceId", authMiddleWare, workspaceContent)
workspaceRouter.post("/:workspaceId/join", authMiddleWare, join)
workspaceRouter.get("/:workspaceId/members", authMiddleWare, getMembership)
workspaceRouter.patch("/:workspaceId/members/:targetUserId/approve", authMiddleWare, approve)
workspaceRouter.patch("/:workspaceId/members/:targetUserId/reject", authMiddleWare, reject)
workspaceRouter.patch("/:workspaceId", authMiddleWare,validateWorkspaceUpdateInput, validateWorkspaceResult, update)
workspaceRouter.delete("/:workspaceId/delete", authMiddleWare, deleteUserWorkspace)
workspaceRouter.patch("/:workspaceId/leave", authMiddleWare, leave)
workspaceRouter.patch("/:workspaceId/members/:targetUserId/remove", authMiddleWare, remove)
workspaceRouter.patch("/:workspaceId/members/:targetUserId/updateUser", authMiddleWare, validateRole, 
    validateWorkspaceResult, updateUserRole)
workspaceRouter.get("/trash", authMiddleWare, userTrash) // not tested yet
workspaceRouter.patch("/:workspaceId/recover", authMiddleWare, recover)
workspaceRouter.delete("/:workspaceId/permanentDelete", authMiddleWare, delUserWorkspacePermanently) // not tested yet
export default workspaceRouter;

//