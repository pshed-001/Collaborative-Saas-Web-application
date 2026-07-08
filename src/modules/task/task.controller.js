import {
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
} from "./task.service.js";

async function createTaskController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
// get all the available tasks in the workspace
async function getAllTasksController(req, res, next) {
    try {
        const userId = req.user.id;
        const workspaceId = req.params.workspaceId;
        const result = await getTasks(userId, workspaceId);
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
    } catch (err) {
        next(err);
    }
}

async function updateTaskController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}

async function deleteTaskController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}

async function restoreTaskController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function deleteTaskPermanentlyController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function getDeletedTaskController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function completeTaskController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function cancelTaskController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function reopenTaskController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function assignTaskController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function submitTaskController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function addTaskCommentController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function getTasksCommentsController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function watchTaskController(req, res, next) {
    try {
    } catch (err) {
        next(err);
    }
}
async function unWatchTaskController(req, res, next) {
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
};
