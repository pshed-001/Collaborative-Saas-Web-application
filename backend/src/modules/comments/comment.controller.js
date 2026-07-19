import { createComment, getAllComments, deleteComment, updateComment } from "./comment.service.js"

export async function createCommentController(req, res, next) {
    try {
        const userId = req.user.id
        const { workspaceId, taskId } = req.params
        const result = await createComment(userId, taskId, workspaceId, req.body)
        res.status(201).json({
            success: result.success,
            message: result.message,
            data: result.data
        })
    } catch (err) {
        next(err)
    }
}

export async function getAllCommentsController(req, res, next) {
    try {
        const userId = req.user.id
        const { workspaceId, taskId } = req.params
        const result = await getAllComments(userId, taskId, workspaceId)
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: result.data
        })
    } catch (err) {
        next(err)
    }
}

export async function updateCommentController(req, res, next) {
    try {
        const userId = req.user.id
        const { workspaceId, taskId, commentId } = req.params
        const result = await updateComment(userId, taskId, workspaceId, { commentId, ...req.body })
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: result.data
        })
    } catch (err) {
        next(err)
    }
}

export async function deleteCommentController(req, res, next) {
    try {
        const userId = req.user.id
        const { workspaceId, taskId, commentId } = req.params
        const result = await deleteComment(userId, taskId, workspaceId, commentId)
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: result.data
        })
    } catch (err) {
        next(err)
    }
}
