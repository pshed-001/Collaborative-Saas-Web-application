import express from "express"
import {
  createCommentController,
  getAllCommentsController,
  updateCommentController,
  deleteCommentController,
} from "./comment.controller.js"
import {
  validateCommentContent,
  validateRepliedUser,
  validateParentId,
  validateCommentId,
} from "./comment.validator.js"
import { validateTaskResult } from "../task/task.validator.js"

const commentRouter = express.Router({ mergeParams: true })

commentRouter.post(
  "/",
  validateCommentContent,
  validateRepliedUser,
  validateParentId,
  validateTaskResult,
  createCommentController
)

commentRouter.get("/", getAllCommentsController)

commentRouter.patch(
  "/:commentId",
  validateCommentId,
  validateCommentContent,
  validateTaskResult,
  updateCommentController
)

commentRouter.delete(
  "/:commentId",
  validateCommentId,
  validateTaskResult,
  deleteCommentController
)

export default commentRouter
