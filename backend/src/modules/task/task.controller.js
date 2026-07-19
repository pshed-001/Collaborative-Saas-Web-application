import * as taskService from "./task.service.js";

async function createTaskController(req, res, next) {
    try {
        const userId = req.user.id
        const workspaceId = req.params.workspaceId
        const taskData = req.body
        const result = await taskService.createTask(userId, workspaceId, taskData)

        res.status(201).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: new Date()
                }
            }
        })
    } catch (err) {
        next(err);
    }
}
// get all the available tasks in the workspace
async function getAllTasksController(req, res, next) {
    try {
        const userId = req.user.id;
        const workspaceId = req.params.workspaceId;

        const { search, ...query } = req.query
        const result = await taskService.getAllTasks(userId, workspaceId, search, query);
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: new Date(),
                    count: result.count,
                },
            },
        });
    } catch (err) {
        next(err);
    }
}
async function getSingleTaskController(req, res, next) {
    try {
        const userId = req.user.id;
        const { workspaceId, taskId } = req.params

        const result = await taskService.getSingleTask(userId, workspaceId, taskId)
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: new Date()
                }
            }
        })
    } catch (err) {
        next(err);
    }
}

async function updateTaskController(req, res, next) {
    try {
        const userId = req.user.id
        const { workspaceId, taskId } = req.params
        const data = req.body
        const result = await taskService.updateTask(userId, taskId, workspaceId, data)

        res.status(201).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                metadata: {
                    timestamp: new Date()
                }
            }
        })

    } catch (err) {
        next(err);
    }
}

async function deleteTaskController(req, res, next) {
    try {
        const userId = req.user.id
        const { workspaceId, taskId } = req.params
        const data = req.body
        const result = await taskService.deleteTask(userId, taskId, workspaceId)

        res.status(201).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                metadata: {
                    timestamp: new Date()
                }
            }
        })

    } catch (err) {
        next(err);
    }
}

async function restoreTaskController(req, res, next) {
    try {
        const userId = req.user.id
        const { workspaceId, taskId } = req.params

        const result = await taskService.restoreTask(userId, taskId, workspaceId)

        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                metadata: {
                    timestamp: new Date()
                }
            }
        })
    } catch (err) {
        next(err);
    }
}
async function getDeletedTaskController(req, res, next) {
    try {
        const userId = req.user.id
        const { workspaceId, taskId } = req.params

        const result = await taskService.getDeletedTask(userId, workspaceId)

        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                metadata: {
                    timestamp: new Date()
                }
            }
        })
    } catch (err) {
        next(err);
    }
}
async function assignTaskController(req, res, next) {
    try {
        const userId = req.user.id
        const { workspaceId, taskId } = req.params

        const { assignedUserId } = req.body
        const result = await taskService.assignTask(userId, taskId, workspaceId, assignedUserId)

        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                metadata: {
                    timestamp: new Date()
                }
            }
        })
    } catch (err) {
        next(err);
    }
}
async function updateTaskStatusController(req, res, next) {
    try {
        const userId = req.user.id
        const { workspaceId, taskId } = req.params
        const { status } = req.body
        const result = await taskService.updateTaskStatus(userId, workspaceId, taskId, status)
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                metadata: {
                    timestamp: new Date()
                }
            }
        })

    } catch (err) {
        next(err)
    }
}

async function deleteTaskPermanentlyController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function uploadAttachmentController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function deleteAttachmentController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function getTaskLogsController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}

export {
    createTaskController,
    getAllTasksController,
    getSingleTaskController,
    updateTaskController,
    updateTaskStatusController,
    deleteTaskController,
    restoreTaskController,
    deleteTaskPermanentlyController,
    getDeletedTaskController,
    assignTaskController,
    uploadAttachmentController,
    deleteAttachmentController,
    getTaskLogsController
};
