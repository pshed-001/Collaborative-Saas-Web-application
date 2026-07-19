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

import commentRouter from "../comments/comment.route.js";

const taskRouter = express.Router({ mergeParams : true })

// general static routes
taskRouter.get("/trash", taskCtrl.getDeletedTaskController)

// route for creating a task and accessing a task
taskRouter.post("/", validateTaskCreation, validateTaskResult, taskCtrl.createTaskController)
taskRouter.get("/", taskCtrl.getAllTasksController)

// routes that needs params and single nested params
// crud routes 
taskRouter.post("/:taskId/assign", taskCtrl.assignTaskController)
taskRouter.patch("/:taskId/status", validateTaskStatus, validateTaskResult, taskCtrl.updateTaskStatusController)

//
taskRouter.patch("/:taskId/restore", taskCtrl.restoreTaskController)
taskRouter.delete("/:taskId/permanent-delete", taskCtrl.deleteTaskPermanentlyController)



// comments
taskRouter.use("/:taskId/comments", commentRouter)

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