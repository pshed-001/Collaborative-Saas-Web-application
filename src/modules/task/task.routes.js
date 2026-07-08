import {
    createTaskController,
    getAllTasksController,
    getSingleTaskController,
    updateTaskController,
    deleteTaskController,
    restoreTaskController,
    deleteTaskPermanentlyController,
    getDeletedTaskController,
    completeTaskController,
    cancelTaskController,
    reopenTaskController,
    assignTaskController,
    submitTaskController,
    addTaskCommentController,
    getTasksCommentsController,
    watchTaskController,
    unWatchTaskController,
    uploadAttachmentController,
    deleteAttachmentController,
    getTaskLogsController
} from "./task.controller.js";

import { authMiddleWare } from "../../middleware/auth.middleware.js";
import express from "express";

import { 
    validateTaskCreation, 
    validateTaskUpdate, 
    validateTaskStatus, 
    validateTaskResult} from "./task.validator.js";

const taskRouter = express.Router()

taskRouter.post("/", authMiddleWare, validateTaskCreation, validateTaskResult, createTaskController)
taskRouter.get("/", authMiddleWare, getAllTasksController)
taskRouter.get("/:taskId", authMiddleWare, getSingleTaskController)
taskRouter.patch("/:taskId", authMiddleWare, validateTaskUpdate, validateTaskResult, updateTaskController)
taskRouter.delete("/:taskId", authMiddleWare, deleteTaskController)

//^ is done in modification

taskRouter.patch("/:taskId/restore", authMiddleWare, restoreTaskController)
taskRouter.delete("/:taskId/deletepermanently", authMiddleWare, deleteTaskPermanentlyController)
taskRouter.get("/trash", authMiddleWare, getDeletedTaskController)
taskRouter.patch("/:taskId/complete", authMiddleWare, completeTaskController)
taskRouter.patch("/:taskId/cancel", authMiddleWare, cancelTaskController)
taskRouter.patch("/:taskId/reopen", authMiddleWare, reopenTaskController)
taskRouter.post("/:taskId/assign", authMiddleWare, assignTaskController)
taskRouter.post("/:taskId/submit", authMiddleWare, submitTaskController)
taskRouter.post("/:taskId/comments", authMiddleWare, addTaskCommentController)
taskRouter.get("/:taskId/comments", authMiddleWare, getTasksCommentsController)
taskRouter.post("/:taskId/watch", authMiddleWare, watchTaskController)
taskRouter.patch("/:taskId/unwatch", authMiddleWare, unWatchTaskController)
taskRouter.post("/:taskId/attachments", authMiddleWare, uploadAttachmentController)
taskRouter.delete("/:taskId/attachments/:attachmentId", authMiddleWare, deleteAttachmentController)
taskRouter.get("/:taskId/activity-logs", authMiddleWare, getTaskLogsController)


export default taskRouter;