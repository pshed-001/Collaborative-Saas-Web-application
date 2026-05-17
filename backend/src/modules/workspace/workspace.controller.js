import {
    approveUser, deleteWorkspace, deleteWorkspacePermanently, getMembers,
    getUserWorkspace, getWorkspaces, getWorkspaceContent,
    joinWorkspace, leaveWorkspace, recoverWorkspace,
    rejectUser, removeUser, trash, updateUser,
    updateWorkspace, workspaceCreator
} from "./workspace.service.js";


// date string for timestamps 
const now = new Date().toISOString()

// controller for creating a new workspace
async function workspace(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await workspaceCreator(req.body, req.user.id);

        return res.status(201).json({
            success: result.success,
            message: result.message,
            data: {
                payload: {
                    id: result.id,
                    name: result.name,
                    description: result.description,
                    mode: result.mode,
                    category: result.category,
                    ownerId: result.ownerId,
                    createdAt: result.createdAt,
                    role: result.role,
                    accessLevel: result.accessLevel,
                },
                meta: {
                    timestamp: now
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

// controller for getting all the the public workspaces available
async function allWorkspaces(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await getWorkspaces(req.query, req.user.id);

        return res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now,
                    count: result.data.length
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

// controller for getting all the workspace a user belong to
async function allUserWorkspaces(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await getUserWorkspace(req.query, req.user.id);

        return res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now,
                    count: result.data.length
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

// controller for getting the content of a workspace
async function workspaceContent(req, res, next) {
    const now = new Date().toISOString()
    try {
        const userId = req.user ? req.user.id : null

        const result = await getWorkspaceContent(userId, req.params.workspaceId)

        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

// controller for joining a workspace 
async function join(req, res, next) {
    const now = new Date().toISOString()
    try {
        const userId = req.user.id || null
        const workspaceId = req.params.workspaceId || null
        const result = await joinWorkspace(userId, workspaceId)

        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

// controller for getting all the members of a workspace
async function getMembership(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await getMembers(req.user.id, req.params.workspaceId);
        res.status(201).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now,
                    count: result.data.length
                }
            }
        })
    } catch (err) {
        next(err)
    }
}
// controller for approving request to private workspace
async function approve(req, res, next) {
    const now = new Date().toISOString()
    try {
        const workspaceId = req.params.workspaceId;
        const result = await approveUser(req.user.id, workspaceId, req.params.targetUserId)
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now
                }
            },

        })
    } catch (err) {
        next(err)
    }
}

// controller for rejecting request to join provate workspace
async function reject(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await rejectUser(req.user.id, req.params.workspaceId,
            req.params.targetUserId);
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now
                }
            },
        })
    } catch (err) {
        next(err)
    }
}

// controller to update a workspace
async function update(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await updateWorkspace(req.user.id, req.params.workspaceId, req.body);

        res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now
                }
            },
        })
    } catch (err) {
        next(err)
    }
}

// controller to delete a workspace
async function deleteUserWorkspace(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await deleteWorkspace(req.user.id, req.params.workspaceId);

        res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now
                }
            },
        })
    } catch (err) {
        next(err)
    }
}

// controller for leaving a workspace
async function leave(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await leaveWorkspace(req.user.id, req.params.workspaceId);

        res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now
                }
            },
        })
    } catch (err) {
        next(err)
    }
}

// controller for removing users
async function remove(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await removeUser(req.user.id, req.params.targetUserId,
            req.params.workspaceId);

        res.status(200).json({
            success: result.success,
            data: {
                payload: {
                    removedUserId: result.removedUserId,
                    workspaceId: result.workspaceId,
                    status: result.membershipStatus
                },
                meta: {
                    timestamp: new Date().toISOString()
                }
            },
            message: result.message
        })
    } catch (err) {
        next(err)
    }
}

// controller for updating user role
async function updateUserRole(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await updateUser(req.user.id, req.params.targetUserId, req.params.workspaceId, req.body.role)

        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

//controller for recovering a deleted workspace, only the owner can 
// recover and only if the workspace is deleted within 30 days
async function recover(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await recoverWorkspace(req.user.id, req.params.workspaceId)
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

// controller for permanently deleting a workspace, only the owner can permanently delete 
// and only if the workspace is deleted for more than 30 days
async function delUserWorkspacePermanently(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await deleteWorkspacePermanently(req.user.id, req.params.workspaceId)

        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

// controller for getting all the workspaces that are deleted by the user
//  but can still be recovered within 30 days
async function userTrash(req, res, next) {
    const now = new Date().toISOString()
    try {
        const result = await trash(req.user.id)

        res.status(200).json({
            success: result.success,
            message: result.message,
            data: {
                payload: result.data,
                meta: {
                    timestamp: now
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

export {
    allUserWorkspaces, allWorkspaces, approve,
    deleteUserWorkspace, delUserWorkspacePermanently, getMembership, join,
    leave, recover, reject, remove,
    update, updateUserRole, userTrash, workspace,
    workspaceContent
}

// war.gov