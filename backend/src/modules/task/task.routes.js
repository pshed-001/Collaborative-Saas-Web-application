// 'use strict'
import * as taskCtrl from "./task.controller.js";

import { authMiddleWare } from "../../middleware/auth.middleware.js";
import express from "express";

// importing validators and validation rules
import {
    validateTaskCreation,
    validateTaskUpdate,
    validateTaskStatus,
    validateTaskResult
} from "./task.validator.js";

const taskRouter = express.Router({ mergeParams : true })

// general static routes
taskRouter.get("/trash", taskCtrl.getDeletedTaskController)

// route for creating a task and accessing a task
taskRouter.post("/", validateTaskCreation, validateTaskResult, taskCtrl.createTaskController)
taskRouter.get("/", taskCtrl.getAllTasksController)

// routes that needs params and single nested params
// crud routes 
taskRouter.patch("/:taskId/complete", taskCtrl.completeTaskController)
taskRouter.patch("/:taskId/cancel", taskCtrl.cancelTaskController)
taskRouter.patch("/:taskId/reopen", taskCtrl.reopenTaskController)
taskRouter.post("/:taskId/assign", taskCtrl.assignTaskController)
taskRouter.post("/:taskId/submit", taskCtrl.submitTaskController)

//
taskRouter.patch("/:taskId/restore", taskCtrl.restoreTaskController)
taskRouter.delete("/:taskId/permanent-delete", taskCtrl.deleteTaskPermanentlyController)



// comments
taskRouter.post("/:taskId/comments", taskCtrl.addTaskCommentController)
taskRouter.get("/:taskId/comments", taskCtrl.getTasksCommentsController)

// watching and unwatching a task
taskRouter.post("/:taskId/watch", taskCtrl.watchTaskController)
taskRouter.patch("/:taskId/unwatch", taskCtrl.unWatchTaskController)

// adding attachmenst and fetching them routes
taskRouter.post("/:taskId/attachments", taskCtrl.uploadAttachmentController)
taskRouter.delete("/:taskId/attachments/:attachmentId", taskCtrl.deleteAttachmentController)

// activity logs per task : who assigned who commented who chanbged status 
taskRouter.get("/:taskId/activity-logs", taskCtrl.getTaskLogsController)

//general task route 
taskRouter.get("/:taskId", taskCtrl.getSingleTaskController)
taskRouter.patch("/:taskId", validateTaskUpdate, validateTaskResult, taskCtrl.updateTaskController)
taskRouter.delete("/:taskId", taskCtrl.deleteTaskController)

export default taskRouter;

//