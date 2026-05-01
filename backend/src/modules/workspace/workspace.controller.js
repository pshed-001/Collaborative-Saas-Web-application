import { workspaceCreator, getWorkspaces, getUserWorkspace, getWorkspaceContent, joinWorkspace, getMembers, approveUser } from "./workspace.service.js";

export async function workspace(req, res, next) {
    try {
        const createWorkspace = await workspaceCreator(req.body, req.user.id);

        return res.status(201).json(createWorkspace)
    } catch (err) {
        next(err)
    }
}

export async function allWorkspaces(req, res, next) {
    try {
        const workspaces = await getWorkspaces(req.query, req.user.id);

        return res.status(workspaces.statusCode).json(workspaces)
    } catch (err) {
        next(err)
    }
}

export async function allUserWorkspaces(req, res, next) {
    try {
        const userWorkspaces = await getUserWorkspace(req.query, req.user.id);

        return res.status(userWorkspaces.statusCode).json(userWorkspaces)
    } catch (err) {
        next(err)
    }
}

export async function workspaceContent(req, res, next) {
    try {
        const workspaceId = req.params.workspaceId
        const userID = req.user ? req.user.id : null
        const result = await getWorkspaceContent(userID, workspaceId)

        res.status(result.statusCode).json(result)
    } catch (err) {
        next(err)
    }
}

export async function join(req, res, next){
    try{
        const userId = req.user.id || null
        const workspaceId = req.params.workspaceId || null
        const result = await joinWorkspace(userId, workspaceId)

        res.status(result.statusCode).json(result)
    }catch(err){
        next(err)
    }
}

export async function getMembership(req, res, next){
    try{
    const members = await getMembers(req.user.id, req.params.workspaceId);
    res.status(members.statusCode).json(members)
    }catch(err){
        next(err)
    }
}

export async function approve(req, res, next){
    try{
        const workspaceId = req.params.workspaceId;
        const result = await approveUser(req.user.id,workspaceId, req.params.targetUserId)
        res.status(result.statusCode).json({
            error : false,
            date : {
                payload : {
                    workspaceId,
                    userId : targetUserId,
                    status : "ACTIVE"
                },
                meta : {}
            },
            message : "User approved successfully",
            statusCode : result.statusCode
        })
    }catch(err){
        throw err
    }
}