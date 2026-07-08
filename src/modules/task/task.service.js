import {
    checkWorkspace,
    validateUserAdmin,
    getMembership,
    checkTask,
    taskRules,
} from "../../middleware/workspacePermission.js";
import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/apperror.js";

async function createTask(userId, workspaceId, taskData) {
    try {
        await checkWorkspace(workspaceId);
        await getMembership(userId, workspaceId);
        const { title, description, priority, duedate, assignedToId } = taskData;
        if (assignedToId !== undefined) {
            await getMembership(assignedToId, workspaceId, (context = "ASSIGNEE"));
        }
        const existingTask = await prisma.task.findFirst({
            where: {
                title,
                workspaceId,
                isDeleted: false,
            },
        });
        if (existingTask) {
            throw new AppError("Task already exists inn this workspace");
        }
        const create = await prisma.task.create({
            data: {
                title,
                description,
                workspaceId,
                createdById: userId,
                duedate,
                assignedToId,
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

        // get all the available tasks
        const tasks = await prisma.task.findMany({
            where: {
                workspaceId,
                isDeleted: false,
            },
        });

        // map the return of each task
        const result = tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            workspaceId: t.workspaceId,
            createdAt: t.createdAt,
            createdBy: t.createdById,
            status: t.status,
            updatedAt: t.updatedAt,
            updatedBy: t.updatedBy,
            assignedTo: t.assignedToId,
            completedBy: t.completedById,
            priority: t.priority,
        }));
        return {
            success: true,
            message: "Tasks fetched successfully",
            data: result,
            count: tasks.count(),
        };
    } catch (err) {
        throw err;
    }
}
async function getSingleTask(userId, workspaceId, taskId, query, search) {
    try {
        const { task } = await taskRules(taskId, userId, workspaceId);

        const {
            isDeleted,
            deletedAt,
            deletedBy,
            recoveredAt,
            updatedAt,
            updatedById,
            ...result
        } = task;
        return {
            success: true,
            message: "Task fetched successfully",
            data: result,
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

        updateData.updatedBy = userId;
        updateData.updatedAt = new Date();

        //updating task based on validated and sanitised input
        const updatedTask = await prisma.task.update({
            where: {
                id_workspaceId: {
                    id: taskId,
                    workspaceId,
                },
            },
            data: updateData,
        });

        //stripping off metadata
        const { isDeleted, deletedAt, deletedBy, recoveredAt, ...result } =
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
        const membership = await getMembership(userId, workspaceId)
        const task = await prisma.task.findFirst({
            where: {
                id_workspaceId: {
                    id: taskId, workspaceId
                }, isDeleted: false
            }
        })
        if (!task) {
            throw new AppError("Task does not exist", 404)
        }
        if (membership.role !== "ADMIN" && task.createdById !== userId) {
            throw new AppError("Unauthorized access", 403)
        }
        const deletedTask = await prisma.task.update({
            where: {
                id_workspaceId: {
                    id: taskId,
                    workspaceId,
                },
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: userId,
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
                deletedBy: true,
            },
        });
        return {
            success: true,
            message: "Task deleted successfully",
            data: deletedTask
        }
    } catch (err) {
        throw err;
    }
}
async function restoreTask(userId, taskId, workspaceId) {
    try {
        await checkWorkspace(workspaceId);
        const membership = await getMembership(userId, workspaceId)
        const task = await prisma.task.findFirst({
            where: {
                id_workspaceId: {
                    id: taskId, workspaceId
                }, isDeleted: true
            }
        })
        if (!task) {
            throw new AppError("Task does not exists in deleted tasks", 404)
        }
        if (membership.role !== "ADMIN" && task.createdById !== userId) {
            throw new AppError("Unauthorized access", 403)
        }
        const updateData = {
            isDeleted: false, recoveredAt: new Date(), recoveredBy: userId
        }
        const restore = await prisma.task.update({
            where: {
                id_workspaceId: {
                    id: taskId, workspaceId
                }
            }, data: updateData
        })
        const { isDeleted, deletedAt, deletedBy, ...result } = restore;
        return {
            success: true,
            message: "Task restored successfully",
            data: result
        }

    } catch (err) {
        throw err
    }
}
async function deleteTaskPermanently(userId, taskId, workspaceId) {
    try {
        await taskRules(true, taskId, userId, workspaceId)

        await prisma.task.delete({
            where: {
                id_workspaceId: {
                    id: taskId, workspaceId
                }
            }
        })
        return {
            success: true,
            message: "Task permanently deleted",
            data: {}
        }
    } catch (err) {
        throw err;
    }
}
async function getDeletedTask(userId, workspaceId) {
    try {
        await checkWorkspace(workspaceId);
        await getMembership(userId, workspaceId)

        const deletedTask = await prisma.task.findMany({
            where: {
                workspaceId, isDeleted: true
            }, select: {
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
                deletedBy: true,
                recoveredAt: true,
                recoveredBy: true
            }
        })

        const count = await prisma.task.count({
            where: {
                workspaceId, isDeleted: true
            }
        })
        return {
            success: true,
            message: "Deleted tasks fetched successfully",
            data: result,
            count
        }
    } catch (err) {
        throw err
    }
}
async function completeTask(userId, taskId, workspaceId, data) { }
async function cancelTask(userId, taskId, workspaceId, data) { }
async function reopenTask(userId, taskId, workspaceId, data) { }
async function assignTask(userId, taskId, workspaceId, assignedUserId) {
    const { task } = await taskRules(true, taskId, userId, workspaceId)

    if (!assignedUserId) {
        throw new AppError("Assigned user is required", 400)
    }
    await getMembership(assignedUserId, workspaceId)

    const status = task.status;
    switch (status) {
        case "CANCELLED":
            throw new AppError("Cancelled task cannot be reassigned", 409)
        case "COMPLETED":
            throw new AppError("Completed task cannot be reassigned")
        default:
            break;
    }
    if (task.assignedToId === assignedUserId) {
        throw new AppError("Cannot reassign the same user to this task", 409)
    }

    const data = {
        assignedToId: assignedUserId, updatedAt: new Date(), updatedById: userId
    }
    const assignedUser = await prisma.task.update({
        where: {
            id_workspaceId: {
                id: taskId, workspaceId
            }
        }, data: data, select: {
            id: true, updatedAt: true, updatedById: true, assignedToId: true
        }
    })
    return {
        success: true,
        messasge: "Task assigned successfully",
        data: assignedUser
    }

}
async function submitTask(userId, taskId, workspaceId, data) {
    
 }










async function addTaskComment(userId, taskId, workspaceId, data) { }
async function getTasksComments(userId, taskId, workspaceId, data) { }
async function watchTask(userId, taskId, workspaceId, data) { }
async function unWatchTask(userId, taskId, workspaceId, data) { }
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
    deleteTaskPermanently,
    getDeletedTask,
    completeTask,
    cancelTask,
    reopenTask,
    assignTask,
    submitTask,
    addTaskComment,
    getTasksComments,
    watchTask,
    unWatchTask,
    uploadAttachment,
    deleteAttachment,
    getTaskLogs,
};
