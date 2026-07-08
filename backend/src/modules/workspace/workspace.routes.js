import express from "express";

import { authMiddleWare } from "../../middleware/auth.middleware.js";
import { validateWorkspaceInput, validateWorkspaceResult, validateRole, validateWorkspaceUpdateInput } from "./workspace.validator.js";
import * as workspaceCtrl from "./workspace.controller.js";
import taskRouter from "../task/task.routes.js";

const workspaceRouter = express.Router()

// global auth middleware for authentication
workspaceRouter.use(authMiddleWare)


// following arrangement to prevent shadowing
// static routes 
workspaceRouter.get("/me", workspaceCtrl.allUserWorkspaces)
workspaceRouter.get("/trash", workspaceCtrl.userTrash) // not tested yet


// route for creating a workspace and getting all workspaces
workspaceRouter.post("/", validateWorkspaceInput, validateWorkspaceResult, workspaceCtrl.workspace);
workspaceRouter.get("/", workspaceCtrl.allWorkspaces)


//single nested params 
workspaceRouter.post("/:workspaceId/join", workspaceCtrl.join)
workspaceRouter.get("/:workspaceId/members", workspaceCtrl.getMembership)
workspaceRouter.patch("/:workspaceId/leave", workspaceCtrl.leave)
workspaceRouter.patch("/:workspaceId/recover", workspaceCtrl.recover)
workspaceRouter.delete("/:workspaceId/permanent-delete", workspaceCtrl.delUserWorkspacePermanently) // not tested yet


//nested routes require double params 
workspaceRouter.patch("/:workspaceId/members/:targetUserId/approve", workspaceCtrl.approve)
workspaceRouter.patch("/:workspaceId/members/:targetUserId/reject", workspaceCtrl.reject)
workspaceRouter.patch("/:workspaceId/members/:targetUserId/remove-user", workspaceCtrl.remove)
workspaceRouter.patch("/:workspaceId/members/:targetUserId/update-user", validateRole,
    validateWorkspaceResult, workspaceCtrl.updateUserRole)


// general routes 
workspaceRouter.get("/:workspaceId", workspaceCtrl.workspaceContent)
workspaceRouter.patch("/:workspaceId", validateWorkspaceUpdateInput, validateWorkspaceResult, workspaceCtrl.update)
workspaceRouter.delete("/:workspaceId", workspaceCtrl.deleteUserWorkspace)

workspaceRouter.use("/:workspaceId/tasks", taskRouter);

export default workspaceRouter;

//