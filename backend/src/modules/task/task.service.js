import {
    checkWorkspace,
    validateUserAdmin,
    getMembership,
    checkTask,
    taskRules,
} from "../../middleware/workspacePermission.js";
import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/apperror.js";

const ALLOWED_TRANSITION = {
    assignee: ["IN_PROGRESS", "COMPLETED"],
    manager: ["COMPLETED", "IN_REVIEW", "IN_PROGRESS", "REVIEWED", "CANCELLED", "TODO"]
}

async function createTask(userId, workspaceId, taskData) {
    try {
        await checkWorkspace(workspaceId);
        await getMembership(userId, workspaceId);
        const { title, description, priority, dueDate, assignedTo } = taskData;
        if (assignedTo !== undefined) {
            await getMembership(assignedTo, workspaceId, "ASSIGNEE");
        }
        const existingTask = await prisma.task.findFirst({
            where: {
                title,
                workspaceId,
                isDeleted: false,
            },
        });
        if (existingTask) {
            throw new AppError("Task already exists in this workspace", 409);
        }
        console.log(priority);
        const create = await prisma.task.create({
            data: {
                title,
                description,
                workspaceId,
                createdById: userId,
                dueDate,
                assignedToId: assignedTo,
                priority,
            },
        });

        const {
            isDeleted,
            deletedAt,
            deletedBy,
            recoveredAt,
            updatedAt,
            updatedById,
            ...result
        } = create;

        return {
            success: true,
            message: "Task created successfully",
            data: result,
        };
    } catch (err) {
        throw err;
    }
}
// function to get all the available task but filtering and search has not yet been added
async function getAllTasks(userId, workspaceId, search, query) {
    try {
        // check if workspace exists
        await checkWorkspace(workspaceId);
        // check if member is an active member
        await getMembership(userId, workspaceId);

        const whereClause = {
            workspaceId,
            isDeleted: false,
        };
        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }
        if (query?.status) {
            whereClause.status = query.status;
        }
        if (query?.priority) {
            whereClause.priority = query.priority;
        }
        // get all the available tasks
        const tasks = await prisma.task.findMany({
            where: whereClause,
            include: {
                createdBy: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // map the return of each task
        const result = tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            workspaceId: t.workspaceId,
            createdAt: t.createdAt,
            dueDate: t.dueDate,
            createdBy: t.createdBy
                ? {
                    id: t.createdBy.id,
                    username: t.createdBy.username,
                    email: t.createdBy.email,
                }
                : null,
            status: t.status,
            updatedAt: t.updatedAt,
            updatedBy: t.updatedById,
            assignedTo: t.assignedToId,
            completedBy: t.completedById,
            priority: t.priority,
        }));
        return {
            success: true,
            message: "Tasks fetched successfully",
            data: result,
            count: tasks.length,
        };
    } catch (err) {
        throw err;
    }
}

async function getSingleTask(userId, workspaceId, taskId) {
    try {
        const { task } = await taskRules(taskId, userId, workspaceId, {
            include: { createdBy: true },
        });

        const {
            isDeleted,
            deletedAt,
            deletedBy,
            recoveredAt,
            updatedAt,
            updatedById,
            ...result
        } = task;

        result.createdBy = task.createdBy ? {
            id: task.createdBy.id,
            username: task.createdBy.username,
            email: task.createdBy.email
        } : null
        return {
            success: true,
            message: "Task fetched successfully",
            data: result
        };
    } catch (err) {
        throw err;
    }
}
// service to update tasks
async function updateTask(userId, taskId, workspaceId, data) {
    try {
        // check if workspace exist, task exist and user is an active member
        const { membership, task } = await taskRules(taskId, userId, workspaceId);

        // check if user is admin
        const isAdmin = membership.role === "ADMIN";

        //check for unauthorized access
        if (userId !== task.createdById && !isAdmin) {
            throw new AppError("Unauthorized access", 403);
        }

        // update data object
        let updateData = {};
        const { title, description, assignedToId, priority } = data;
        if (title !== undefined) {
            updateData.title = title;
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        if (assignedToId !== undefined) {
            // check if the assigned to is an active member
            // getmembership throws err if user is not an active member or admin
            await getMembership(assignedToId, workspaceId);
            updateData.assignedToId = assignedToId;
        }
        if (priority !== undefined) {
            updateData.priority = priority;
        }

        if (Object.keys(updateData).length === 0) {
            throw new AppError("At least one field is required", 400);
        }

        updateData.updatedById = userId;
        updateData.updatedAt = new Date();

        //updating task based on validated and sanitised input
        const updatedTask = await prisma.task.update({
            where: {
                id: taskId,
            },
            data: updateData,
        });

        //stripping off metadata
        const { isDeleted, deletedAt, deletedById, recoveredAt, ...result } =
            updatedTask;
        return {
            success: true,
            message: "Task successfully updated",
            data: result,
        };
    } catch (err) {
        throw err;
    }
}
async function deleteTask(userId, taskId, workspaceId) {
    try {
        await checkWorkspace(workspaceId);
        const membership = await getMembership(userId, workspaceId);
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                workspaceId: workspaceId,
                isDeleted: false,
            },
        });
        if (!task) {
            throw new AppError("Task does not exist", 404);
        }
        if (membership.role !== "ADMIN" && task.createdById !== userId) {
            throw new AppError("Unauthorized access", 403);
        }
        const deletedTask = await prisma.task.update({
            where: {
                id: taskId,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedById: userId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                workspaceId: true,
                createdAt: true,
                createdById: true,
                isDeleted: true,
                deletedAt: true,
                deletedById: true,
                deletedByUser: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            }
        });
        return {
            success: true,
            message: "Task deleted successfully",
            data: deletedTask,
        };
    } catch (err) {
        throw err;
    }
}
async function restoreTask(userId, taskId, workspaceId) {
    try {
        await checkWorkspace(workspaceId);
        const membership = await getMembership(userId, workspaceId);
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                workspaceId,
                isDeleted: true
            }
        });
        if (!task) {
            throw new AppError("Task does not exist in deleted tasks", 404);
        }
        if (membership.role !== "ADMIN" && task.createdById !== userId) {
            throw new AppError("Unauthorized access", 403);
        }
        const updateData = {
            isDeleted: false,
            recoveredAt: new Date(),
            recoveredById: userId,
        };
        const restore = await prisma.task.update({
            where: {
                id: taskId,
            },
            data: updateData,
            select: {
                id: true,
                title: true,
                description: true,
                workspaceId: true,
                createdAt: true,
                createdById: true,
                recoveredAt: true,
                recoveredById: true,
                recoveredByUser: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            }
        });
        return {
            success: true,
            message: "Task restored successfully",
            data: restore,
        };
    } catch (err) {
        throw err;
    }
}
async function getDeletedTask(userId, workspaceId) {
    try {
        await checkWorkspace(workspaceId);
        await getMembership(userId, workspaceId);

        const deletedTask = await prisma.task.findMany({
            where: {
                workspaceId,
                isDeleted: true,
            },
            select: {
                id: true,
                title: true,
                description: true,
                workspaceId: true,
                createdAt: true,
                createdById: true,
                completedById: true,
                assignedToId: true,
                status: true,
                priority: true,
                updatedAt: true,
                updatedById: true,
                isDeleted: true,
                deletedAt: true,
                recoveredAt: true,
                deletedByUser: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            },
            orderBy: {
                deletedAt: "desc"
            }
        });

        const count = await prisma.task.count({
            where: {
                workspaceId,
                isDeleted: true,
            },
        });
        return {
            success: true,
            message: "Deleted tasks fetched successfully",
            data: deletedTask,
            count,
        };
    } catch (err) {
        throw err;
    }
}
async function assignTask(userId, taskId, workspaceId, assignedUserId) {
    try {
        const { task } = await taskRules(taskId, userId, workspaceId);

        if (!assignedUserId) {
            throw new AppError("Assigned user is required", 400);
        }
        await getMembership(assignedUserId, workspaceId);

        const status = task.status;
        switch (status) {
            case "CANCELLED":
                throw new AppError("Cancelled task cannot be reassigned", 409);
            case "COMPLETED":
                throw new AppError("Completed task cannot be reassigned", 409);
            default:
                break;
        }
        if (task.assignedToId === assignedUserId) {
            throw new AppError("Cannot reassign the same user to this task", 409);
        }

        const data = {
            assignedToId: assignedUserId,
            updatedAt: new Date(),
            updatedById: userId,
        };
        const assignedUser = await prisma.task.update({
            where: {
                id: taskId,
            },
            data: data,
            select: {
                id: true,
                updatedAt: true,
                title: true,
                description: true,
                dueDate: true,
                createdAt: true,
                updatedByUser: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
            },
        });
        return {
            success: true,
            message: "Task assigned successfully",
            data: assignedUser,
        };
    } catch (err) {
        throw err
    }
}
async function updateTaskStatus(userId, workspaceId, taskId, taskStatus) {
    try {
        const { membership, task } = await taskRules(taskId, userId, workspaceId)
        const isManager = membership.role === "ADMIN" || task.createdById === userId
        const isAssignee = task.assignedToId === userId

        let capable
        if (isManager) {
            capable = "manager"
        } else if (isAssignee) {
            capable = "assignee"
        } else {
            throw new AppError("You do not have permission to update this task status.", 401)
        }
        const allowed = ALLOWED_TRANSITION[capable]
        if (!allowed.includes(taskStatus)) {
            throw new AppError("The task status seleted is not permitted.", 400)
        }
        const updatedTaskStatus = await prisma.task.update({
            where: {
                id: taskId,
                isDeleted: false
            },
            data: {
                status: taskStatus,
                updatedById : userId
            },
            select: {
                id: true,
                title: true,
                description: true,
                dueDate: true,
                workspaceId: true,
                createdAt: true,
                priority: true,
                updatedByUser: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }

            }
        })
        return {
            success: true,
            message: "Task status updated successfully",
            data: updatedTaskStatus
        }
    } catch (err) {
        throw err
    }
}
async function deleteTaskPermanently(userId, taskId, workspaceId) {
    try {
        //npot function yet :
        // you have to move : from attachemdnts to comment to task
        await taskRules(true, taskId, userId, workspaceId);

        await prisma.task.delete({
            where: {
                id_workspaceId: {
                    id: taskId,
                    workspaceId,
                },
            },
        });
        return {
            success: true,
            message: "Task permanently deleted",
            data: {},
        };
    } catch (err) {
        throw err;
    }
}
async function uploadAttachment(userId, taskId, workspaceId, data) { }
async function deleteAttachment(userId, taskId, workspaceId, data) { }
async function getTaskLogs(userId, taskId, workspaceId, data) { }

export {
    createTask,
    getAllTasks,
    getSingleTask,
    updateTask,
    deleteTask,
    restoreTask,
    updateTaskStatus,
    deleteTaskPermanently,
    getDeletedTask,
    assignTask,
    uploadAttachment,
    deleteAttachment,
    getTaskLogs,
};
