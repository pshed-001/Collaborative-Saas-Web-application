import prisma from "../config/prisma.js";
import "dotenv/config";
import { AppError } from "./apperror.js";

// a function to check if a workspace exists or not
const checkWorkspace = async (workspaceId, isDeleted = false) => {
  const workspace = await prisma.workspace.findFirst({
    // 400 if not valid input and 404 if not found
    where: { id: workspaceId, isDeleted },
  });
  if (!workspace) {
    throw new AppError("Workspace does not exist", 404);
  }
  return workspace;
}

// check if a user is an active member of the workspace
const getMembership = async (targetUserId, workspaceId, context = "USER") => {
  const membership = await prisma.membership.findFirst({
    where: {
      userId: targetUserId, workspaceId, isDeleted: false
    }
  })
  if (!membership || membership.status !== "ACTIVE") {
    const message = context === "ASSIGNEE" ? "Assigned user is not a member of the workspace"
      : "User is not an active member of this workspace, kindly join the workspace"
    throw new AppError(message, 403)

  }
  return membership;
}

// check if a user is an active admin member of the workspace
const validateUserAdmin = async (requesterId, workspaceId) => {
  const membership = await prisma.membership.findFirst({
    where: {
      userId: requesterId,
      workspaceId: workspaceId,
      isDeleted: false
    }
  })
  if (!membership || membership.role !== "ADMIN" || membership.status !== "ACTIVE") {
    throw new AppError("Unauthorised access", 403);
  }
  return membership;
}

// check if a task exists in the workspace 
const checkTask = async (taskId, workspaceId, taskOption = {}) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, workspaceId: workspaceId, isDeleted: false, ...taskOption.where },
    include: taskOption?.include,
  });
  if (!task) {
    throw new AppError("Task does not exist", 404);
  }
  return task;
}

const taskRules = async ( taskId, userId, workspaceId, taskOptions = {},requireAdmin = false) => {
  // all function throw err if encountered 
  // and they are caught and handled by the error middleware
  const [workspace, membership, task] = await Promise.all([
    checkWorkspace(workspaceId),
    requireAdmin ?
      validateUserAdmin(userId, workspaceId) :
      getMembership(userId, workspaceId),
    checkTask(taskId, workspaceId, taskOptions)
  ])

  return { workspace, membership, task };
}
export {
  checkTask,
  checkWorkspace,
  getMembership,
  taskRules,
  validateUserAdmin,

}

//