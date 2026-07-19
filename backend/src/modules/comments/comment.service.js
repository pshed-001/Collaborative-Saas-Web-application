// starting to populate comment service logic
// rules are :
// 1. workspace must exist and be active
// 2. user must be an active member of the workspace
// 3. task to comment on must be active

import prisma from "../../config/prisma.js"
import { taskRules } from "../../middleware/workspacePermission.js"
import { AppError } from "../../middleware/apperror.js"

async function createComment(userId, taskId, workspaceId, commentData) {
    await taskRules(taskId, userId, workspaceId)

    const { content, parentId, repliedUserId } = commentData

    if (!parentId && !repliedUserId) {
        const createdCommentData = await prisma.comment.create({
            data: { content, authorId: userId, taskId },
            select: {
                id: true, content: true, createdAt: true, depth: true,
                author: { select: { id: true, username: true } },
                repliedUser: { select: { id: true, username: true } }
            }
        })
        return { success: true, message: "Comment created successfully", data: createdCommentData }
    }

    if (!parentId || !repliedUserId) {
        throw new AppError("Cannot reply to a comment without parent id or without specifying who to reply to", 400)
    }

    const targetMember = await prisma.membership.findUnique({
        where: {
            userId_workspaceId: { userId: repliedUserId, workspaceId },
            status: "ACTIVE",
            isDeleted: false
        }
    })
    if (!targetMember) {
        throw new AppError("This user is not an active member of this workspace", 400)
    }

    const parentComment = await prisma.comment.findUniqueOrThrow({ where: { id: parentId } })
    if (parentComment.isDeleted || parentComment.taskId !== taskId) {
        throw new AppError("The parent comment does not exist", 400)
    }

    let depth, rootParentId
    if (parentComment.depth === 0) {
        depth = 1
        rootParentId = parentId
    } else {
        depth = 1
        rootParentId = parentComment.parentId
        const rootParent = await prisma.comment.findUnique({ where: { id: rootParentId } })
        if (!rootParent || rootParent.isDeleted) {
            throw new AppError("The thread parent comment has been deleted", 400)
        }
    }

    const createdCommentData = await prisma.comment.create({
        data: { content, authorId: userId, taskId, parentId: rootParentId, repliedUserId, depth },
        select: {
            id: true, content: true, createdAt: true, depth: true,
            author: { select: { id: true, username: true } },
            repliedUser: { select: { id: true, username: true } }
        }
    })
    return { success: true, message: "Comment created successfully", data: createdCommentData }
}
async function getAllComments(userId, taskId, workspaceId) {
    await taskRules(taskId, userId, workspaceId)

    const comments = await prisma.comment.findMany({
        where: {
            taskId
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            depth: true,
            parentId: true,
            isDeleted: true,
            author: {
                select: {
                    id: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                }
            },
            repliedUser: {
                select: {
                    id: true,
                    username: true
                }
            }
        },
        orderBy: {
            createdAt: "asc"
        }
    })
    const sanitisedComment = comments.map((comment) => {
        if (comment.isDeleted) {
            return {
                ...comment,
                content: "This comment was deleted",
                author: {
                    firstname: "Deleted",
                    lastname: "User",
                    username: "deletedUser",
                }
            }
        }
        return comment

    })
    return {
        success: true,
        message: "Comment successfully fetched",
        data: sanitisedComment
    }
}
async function deleteComment(userId, taskId, workspaceId, commentId) {
    const [rules, comment] = await Promise.all([
        taskRules(taskId, userId, workspaceId),
        prisma.comment.findUnique({
            where: {
                id: commentId
            }
        })
    ])
    const isAdmin = rules.membership.role === "ADMIN"
    const isOwner = userId === comment.authorId

    if (!comment || comment.taskId !== taskId) {
        throw new AppError("Comment to delete does not exist.", 400)
    }
    if (!isAdmin && !isOwner) {
        throw new AppError("You do not have permission to delete this comment", 401)
    }
    const softDeletedComment = await prisma.comment.update({
        where: {
            id: commentId
        },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedById: userId,
        },
        select: {
            id: true,
            taskId: true,
            isDeleted: true,
            deletedAt: true,
            deletedByUser: {
                select: {
                    id: true,
                    username: true,
                }
            },
            author: {
                select: {
                    id: true,
                    username: true,

                }
            }
        }
    })
    const sanitisedPayload = {
        ...softDeletedComment,
        content: isAdmin ? "This comment was deleted by an admin" : "This comment has been deleted." 
    }
    return {
        success: true,
        message: "Comment successfully deleted",
        data: sanitisedPayload
    }
}
async function updateComment(userId, taskId, workspaceId, data) {
    const { commentId, content } = data
    const [rules, comment] = await Promise.all([
        taskRules(taskId, userId, workspaceId),
        prisma.comment.findUnique({
            where: {
                id: commentId
            }
        })
    ])
    if (!comment || comment.isDeleted) {
        throw new AppError("This comment does not exist", 400)
    }
    if (comment.authorId !== userId) {
        throw new AppError("You do not have permission to update this task", 401)
    }
    const updatedCommentData = await prisma.comment.update({
        where: {
            id: commentId
        },
        data: {
            content: content,
            updatedAt: new Date()
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            depth: true,
            isDeleted: true,
            author: {
                select: {
                    id: true,
                    username: true
                }
            },
            taskId: true,
            repliedUser: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    })

    return {
        success: true,
        message: "Comment successfully updated.",
        data: updatedCommentData
    }
 }

 export {createComment, getAllComments, deleteComment, updateComment}