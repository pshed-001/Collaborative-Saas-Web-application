import prisma from "../../config/prisma.js";
import "dotenv/config";
import { AppError } from "../../middleware/apperror.js";
import { checkWorkspace, getMembership, validateUserAdmin } from "../../middleware/workspacePermission.js";

// service to create a new workspace
async function workspaceCreator(workspaceCreationData, userId) {
  try {
    if (Array.isArray(workspaceCreationData.category)) {
      workspaceCreationData.category = workspaceCreationData.category.join(',');
    }
    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceCreationData.workspaceName,
          description: workspaceCreationData.description,
          mode: workspaceCreationData.mode,
          category: workspaceCreationData.category,
          ownerId: userId,
        },
      })
      const membership = await tx.membership.create({
        data: {
          userId: userId,
          workspaceId: workspace.id,
          role: "ADMIN",
          status: "ACTIVE",
        },
      });
      return { workspace, membership }
    })
    const { workspace, membership } = result;
    return {
      success: true,
      message: "Workspace successfully created",
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      mode: workspace.mode,
      category: workspace.category,
      ownerId: workspace.ownerId,
      createdAt: typeof workspace.createdAt === "string" ? workspace.createdAt :
        workspace.createdAt.toISOString(),
      role: membership.role,
      accessLevel: membership.role === "ADMIN" ? "ADMIN" :
        (membership.role === "MEMBER" ? "MEMBER" : "VIEW_ONLY"),
    };
  } catch (err) {
    if (err && err.code === "P2002") {
      throw new AppError("Workspace already exists", 400);
    }
    throw err;
  }
}

// getting all public workspaces with filter of category 
// and also checking if the user is a member of the workspace or not to give the status 
// and role of the user in that workspace
async function getWorkspaces(query, userId) {
  try {
    const whereClause = {
      mode: "PUBLIC",
      isDeleted: false,
    };

    // Fix substring bug by splitting comma-separated strings for exact array/list matching
    if (query.category) {
      const category = query.category.split(',').map(c => c.trim().toLowerCase());
      whereClause.OR = category.map(cat => ({
        category: {
          contains: cat,
        },
      }));
    }

    const workspacesData = await prisma.workspace.findMany({
      where: whereClause,
      include: {
        memberships: {
          where: { userId: userId },
          take: 1, // Enforce single record retrieval at database level
        },
      },
    });

    // Map rows cleanly to match the exact schema expected by the controller
    const payloads = workspacesData.map((w) => {
      const membership = w.memberships[0] || null;

      let accessLevel = "VIEW_ONLY";
      if (membership) {
        accessLevel = membership.role === "ADMIN" ? "ADMIN" : (membership.role === "MEMBER" ? "MEMBER" : "VIEW_ONLY");
      }

      return {
        workspaceId: w.id,
        name: w.name,
        description: w.description,
        mode: w.mode,
        category: w.category,
        createdAt: w.createdAt ? w.createdAt.toISOString() : null,
        status: membership?.status || null,
        role: membership?.role || null,
        accessLevel,
      };
    });

    // Return unified object structure required by your Express controller
    return {
      success: true,
      message: "Workspaces fetched successfully",
      data: payloads
    };

  } catch (err) {
    console.error("Error fetching workspaces:", err);
    throw err; // Forwards error to the controller try/catch block
  }
}

// service for getting all the workspce a useer belong to
async function getUserWorkspace(query, userId) {
  try {
    // database query clause
    const whereClause = {
      userId,
      isDeleted: false,
      status: {// filtering out status for workspace that user no longer belong to
        notIn: ["REJECTED", "REMOVED", "LEFT"]
      }
    }

    // filtering based on search and category
    if (query.category) {
      // getting user query for filtering
      const category = query.category.split(",").map(c => c.toLowerCase().trim())
      // populating whereClause to include the category
      whereClause.OR = category.map(cat => ({
        category: {
          contains: cat
        }
      }))
    }

    // searching database for user membership
    const membership = await prisma.membership.findMany({
      where: whereClause,
      include: { workspace: true },
    });

    // data to be returned
    const payloads = membership.map((m) => {
      const accessLevel = m.role === "ADMIN" ? "ADMIN" : (m.role === "MEMBER" ? "MEMBER" : "VIEW_ONLY");
      return {
        workspaceId: m.workspaceId,
        name: m.workspace.name,
        description: m.workspace.description,
        mode: m.workspace.mode,
        category: m.workspace.category,
        createdAt: m.workspace.createdAt.toISOString(),
        role: m.role,
        status: m.status,
        accessLevel
      }
    });
    // return object
    return {
      success: true,
      message: "Workspaces fetched successfully",
      data: payloads
    }
  } catch (err) {
    throw err; // forwad error to controller 
  }
}

// getting or entering a specific workspace
async function getWorkspaceContent(userId, workspaceId) {
  try {
    // checking if workspace exists
    const workspace = await checkWorkspace(workspaceId);

    const whereClause = {
      workspaceId,
      isDeleted: false
    }

    if (userId) {
      whereClause.userId = userId;
    }

    const membership = await prisma.membership.findFirst({
      where: whereClause,
    });

    // destruturing and getting needed data from the workspace
    const { id, name, description, mode, category, ownerId, createdAt } = workspace;
    //getting the role of the user 
    const role = membership?.role || null;
    // determining access level of the user
    const accessLevel = role ? (role === "ADMIN" ? "ADMIN" : "MEMBER") : "VIEW_ONLY";

    // only public workspaces are visible for non members and 
    // private workspaces are not visible to non members unless you are an active member
    // checking access for private workspaces
    if ((!membership || membership.status !== "ACTIVE") && mode === "PRIVATE") {
      throw new AppError("User not authorised to access this resource", 403);
    }

    return {
      success: true,
      message: "Workspace fetched successfully",
      data: {
        id,
        name,
        description,
        mode,
        category,
        ownerId: membership ? ownerId : null,
        createdAt: createdAt.toISOString(),
        role,
        accessLevel,
      }
    }
  } catch (err) {
    if (err.code === "P2025") {
      throw new AppError("Workspace does not exist", 404);
    }
    throw err;
  }
}

// joining a specific workspace
async function joinWorkspace(userId, workspaceId) {
  try {
    // checking if workspace exists
    const workspace = await checkWorkspace(workspaceId);
    //checking if owner is attempting to rejoin the workspace
    if (workspace.ownerId === userId) {
      throw new AppError("Owner is already part of this workspace", 409);
    }

    // checking for existing membership
    const membership = await prisma.membership.findFirst({
      where: {
        userId: userId,
        workspaceId: workspaceId,
        isDeleted: false
      },
    });

    let join;
    if (membership) {
      // handling user tha have a membership in the workspace already
      switch (membership.status) {
        // managing active members
        case "ACTIVE":
          throw new AppError("Already a member", 409);
        // managing  pending request
        case "PENDING":
          throw new AppError("Already has a pending request sent", 409);
        // managing remived used
        case "REMOVED":
          throw new AppError("User cannot join this workspace", 400);
        // managing rejected or left users
        case ("LEFT" || "REJECTED"):
          join = await prisma.membership.update({
            where: {
              userId_workspaceId: {
                userId: userId,
                workspaceId: workspaceId,
              },
            },
            data: {
              status: workspace.mode === "PRIVATE" ? "PENDING" : "ACTIVE", role: "MEMBER"
            },
          });
          break;
        default:
          throw new AppError("Invalid membership state", 500);
      }
    } else {
      // creating new membership for new users 
      join = await prisma.membership.create({
        data: {
          userId: userId,
          workspaceId: workspaceId,
          role: "MEMBER",
          status: workspace.mode === "PRIVATE" ? "PENDING" : "ACTIVE",
        },
      });
    }

    // return object
    return {
      success: true,
      message: workspace.mode === "PUBLIC" ? "Workspace joined successfully"
        : "Workspace request sent",
      data: {
        workspaceId: workspace.id,
        role: join.role,
        accessLevel: join.status === "ACTIVE" ? "MEMBER" : "VIEW_ONLY",
        status: join.status,
      },

    };
  } catch (err) {
    const code = err.code;
    switch (code) {
      case "P2025":
        throw new AppError("Workspace does not exist", 404);
      case "P2002":
        throw new AppError("Already a member", 409);
    }

    throw err;
  }
}

// getting the members of a specific workspace
async function getMembers(userId, workspaceId) {
  try {
    const workspace = await checkWorkspace(workspaceId);

    const authorised = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId,
        },
        isDeleted: false
      },
    });
    if (!authorised || authorised.status === "PENDING") {
      throw new AppError("Unauthorised access", 403)
    }

    let isAdmin = authorised.role === "ADMIN"

    const members = await prisma.membership.findMany({
      where: {
        workspaceId: workspaceId,
        status: {
          notIn: ["LEFT", "REMOVED", "REJECTED"]
        },
        isDeleted: false
      },
      select: {
        userId: true, role: true, status: isAdmin
      }
    })
    return {
      success: true,
      message: "Members fetched successfully",
      data: members
    }
  } catch (err) {

    throw err
  }
}

// accept user request to join workspace
async function approveUser(requesterId, workspaceId, targetUserId) {
  try {
    const workspace = await checkWorkspace(workspaceId); // checking if workspace exists
    if (requesterId === targetUserId) {
      throw new AppError("Cannot approve yourself", 400)
    }
    const membership = await validateUserAdmin(requesterId, workspaceId)
    // checking if user is authorised

    const checkReq = await getMembership(targetUserId, workspaceId);
    // getting members of a workspace by getting all request

    if (!checkReq) {
      throw new AppError("Request not found", 404)
    }
    if (checkReq.status !== "PENDING") {
      throw new AppError("User is not in  pending state", 409)
    }
    // updating membership to approve user request
    const update = await prisma.membership.update({
      where: {
        userId_workspaceId: {
          userId: targetUserId, workspaceId: workspaceId
        }
      },
      data: {
        status: "ACTIVE"
      }
    })
    return {
      success: true,
      message: "User approved successfully",
      data: {
        workspaceId, targetUserId,
        status: update.status,
        role: update.role
      }
    }
  } catch (err) {

    throw err
  }
}

// reject user request to join workspace
async function rejectUser(requesterId, workspaceId, targetUserId) {
  try {
    await checkWorkspace(workspaceId);

    // enduring that user cannot reject themselves
    if (requesterId === targetUserId) {
      throw new AppError("Cannot reject yourself", 400)
    }
    // checking if user is still an active administrator
    await validateUserAdmin(requesterId, workspaceId)

    const checkReq = await getMembership(targetUserId, workspaceId);
    if (!checkReq) {
      throw new AppError("User is not in pending state", 409)
    }
    /*
    if (checkReq.status !== "PENDING") {
      throw new AppError("Invalid state", 409)
    }*/
    // checking the db for pending request adn rejecting it
    const update = await prisma.membership.delete({
      where: {
        userId: targetUserId, workspaceId: workspaceId, isDeleted: false,
        status: "PENDING"
      },
      data: {
        status: "REJECTED"
      }
    })
    // verifying the count of peending result against 0
    if (update.count === 0) {
      throw new AppError("User is not in pending state", 409)
    }
    return {
      success: true,
      message: "User rejected successfully",
      data: {
        workspaceId, targetUserId, status: "REJECTED",
        statusCode: 200
      }
    }
  } catch (err) {
    throw err
  }

}// logging don't forget

// modify a workspace
async function updateWorkspace(userId, workspaceId, workspaceData) {
  try {
    // checking if workspace exists
    await checkWorkspace(workspaceId);
    // checking if user is an active administrator member
    await validateUserAdmin(userId, workspaceId);

    let updateData = {};
    // validating user input and populating up  update data
    const { workspaceName, description, category, mode } = workspaceData
    if (mode !== undefined) {
      throw new AppError("Workspace mode cannot be updated ", 400)
    }
    if (workspaceName !== undefined) {
      updateData.name = workspaceName
    }
    if (description !== undefined) {
      updateData.description = description
    }
    if (category !== undefined) {
      Array.isArray(category) ? updateData.category = category.join(',') : updateData.category = category
    }
    if (Object.keys(updateData).length === 0) {
      throw new AppError("Kindly fill at least one field", 400)
    }
    updateData.updatedBy = userId
    updateData.updatedAt = new Date();



    // updating workspace based on user input
    const updatedWorkspace = await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: updateData

    })
    // destructuring to remove unwanted data 
    const { deletedBy, deletedAt, isDeleted, ...result } = updatedWorkspace;
    // return object
    return {
      success: true, message: "Workspace updated successfully",
      data: result
    }
  } catch (err) {
    if (err.code === "P2002") {
      throw new AppError("Workspace name already exists : A deleted workspace bears the same name in case of restoring workspace",
        409)
    }
    throw err
  }
}
// delete a workspace
async function deleteWorkspace(userId, workspaceId) {
  const workspace = await checkWorkspace(workspaceId)

  // ensuring only owner can delete workspace
  if (workspace.ownerId !== userId) {
    throw new AppError("Unauthorised access", 403)
  }
  const now = new Date();
  const deleteData = { deletedAt: now, isDeleted: true, deletedBy: userId }

  // performing soft delete incase of recovery attempt 
  // and making use of transactions
  await prisma.$transaction([
    prisma.membership.updateMany({
      where: {
        workspaceId: workspaceId
      },
      data: deleteData
    }),
    prisma.workspace.update({
      where: {
        id: workspaceId
      },
      data: deleteData
    }),

    prisma.task.updateMany({
      where: {
        workspaceId: workspaceId
      },
      data: deleteData
    })

  ])
  return {
    success: true, message: "Workspace deleted successfully",
    data: workspaceId
  }
  // which data sould be added and if isdeleted is added : 
  // then the whole logic on the code will change for other servies 
  // because they have to check before operating is is deletd is true or not
}

// leave a workspace
async function leaveWorkspace(userId, workspaceId) {
  const workspace = await checkWorkspace(workspaceId)
  let updateMembership;
  // making sure that the owner cannot leave the workspace
  if (workspace.ownerId === userId) {
    throw new AppError("Workspace owner cannot leave workspace", 403)
  }
  // performing transactions for concurrent request 
  // use database locking to prevent last two admins form leaving at the same time 
  // sqlite is used so that is impossible but it will be odne when db has changed to postgresql or mysql
  await prisma.$transaction(async (tx) => {
    const membership = await tx.membership.findFirst({
      where: {
        userId, workspaceId, isDeleted: false
      }
    })
    // checking user stattus before proeedingwith leave request
    if (!membership || membership.status !== "ACTIVE") {
      throw new AppError("User is not an active member", 403)
    }
    // checking active admin to make sure that the workspace is not left without administarators
    const activeAdminCount = await tx.membership.count({
      where: {
        workspaceId: workspaceId,
        role: "ADMIN",
        status: "ACTIVE",
        isDeleted: false
      }
    })

    if (activeAdminCount <= 1 && membership.role === "ADMIN") {
      throw new AppError("Workspace needs at least one admin to function properly", 409)
    }
    // updating user membership to left incase of new attempt to join
    updateMembership = await tx.membership.update({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId
        }
      },
      data: {
        status: "LEFT", role: null
      }
    })
  })

  return {
    success: true, message: "User left successfully",
    data: {
      workspaceId, userId,
      membershipStatus: updateMembership.status
    }
  }
}

// remove a user from a workspace
async function removeUser(userId, targetUserId, workspaceId) {
  //checking if workpace exists
  const workspace = await checkWorkspace(workspaceId)

  // making sure thatv only administrators can remove users 
  await validateUserAdmin(userId, workspaceId)

  // making sure that administrators cannot remove themselves
  if (workspace.ownerId === targetUserId) {
    throw new AppError("Owner cannot be removed from workspace", 403)
  }
  // making sure that users cannot remove themselves
  // rather they should leave instead
  if (userId === targetUserId) {
    throw new AppError("Kindly leave instead of removing yourself", 400)
  }
  let updateMembership;
  // performing transactions for concurrent request 
  // use database locking to prevent last two admins form leaving at the same time 
  // sqlite is used so that is impossible but it will be odne when db has changed to postgresql or mysql
  await prisma.$transaction(async (tx) => {
    const membership = await tx.membership.findFirst({
      where: {
        userId: targetUserId, workspaceId, isDeleted: false
      }
    })
    // making sure that only active members can be removed 
    if (!membership || membership.status !== "ACTIVE") {
      throw new AppError("User is not an active member", 403)
    }
    // counting the number or actice administrators
    const activeAdminCount = await tx.membership.count({
      where: {
        workspaceId: workspaceId,
        role: "ADMIN",
        status: "ACTIVE",
        isDeleted: false
      }
    })
    // makin sure at least one admin remains in the workspace
    if (activeAdminCount <= 1 && membership.role === "ADMIN") {
      throw new AppError("Workspace needs at least one admin to function properly", 409)
    }
    // updating user membership for removing user 
    // once users are removed they canot rejoin  but they can only be accepted back
    updateMembership = await tx.membership.update({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId: targetUserId
        }
      },
      data: {
        status: "REMOVED", role: null
      }
    })
  })

  return {
    success: true, message: "User removed successfully",
    statusCode: 200, removedUserId: targetUserId, workspaceId,
    membershipStatus: updateMembership.status
  }
}

// update user
async function updateUser(requesterId, targetUserId, workspaceId, newRole) {
  // checking if workspace exists
  await checkWorkspace(workspaceId)
  // checking if requested is an active administrator member
  await validateUserAdmin(requesterId, workspaceId)
  // checking if target user is an active member of the workspace
  const membership = await getMembership(targetUserId, workspaceId)
  // making sure user is an active member of the workspace
  if (!membership || (membership.role === null) || (membership.status !== "ACTIVE")) {
    throw new AppError("User is not an active member of this workspace", 403)
  }
  // making sure user cannot escalate their privilege
  if (requesterId === targetUserId) {
    throw new AppError("User cannot escalate their privilege", 403)
  }
  // making sure role is not been changed without been changed e.g. ADMIN == ADMIN 
  if (membership.role === newRole) {
    throw new AppError("Kindly select a different role", 409)
  }
  // updating target user role
  const updatedRole = await prisma.membership.update({
    where: {
      userId_workspaceId: {
        userId: targetUserId,
        workspaceId,
      }
    },
    data: {
      role: newRole
    }
  })
  // return object
  return {
    success: true,
    message: "User role updated successfully",
    data: {
      userId: updatedRole.userId,
      role: updatedRole.role,
      workspaceId: updatedRole.workspaceId,
      status: updatedRole.status
    }
  }
}

// recover workspace
async function recoverWorkspace(userId, workspaceId) {
  try {
    // check if workspace exists 
    const workspace = await checkWorkspace(workspaceId);
    if (workspace.isDeleted === false) {
      throw new AppError("Workspace is not deleted", 400)
    }
    // check if user is the workspace owner
    if (userId !== workspace.ownerId) {
      throw new AppError("Only workspace owner can recover deleted workspace", 409)
    }
    // field to update
    const updateData = { isDeleted: false, recoveredAt: new Date() }

    // performing recovery of workspace
    // and making use of transactions
    await prisma.$transaction([
      prisma.membership.updateMany({
        where: {
          workspaceId: workspaceId
        },
        data: updateData
      }),
      prisma.workspace.update({
        where: {
          id: workspaceId
        },
        data: updateData
      }),

      prisma.task.updateMany({
        where: {
          workspaceId: workspaceId
        },
        data: updateData
      })

    ])
    const { isDeleted, deletedAt, deletedBy, ...result } = workspace;
    return {
      success: true, message: "Workspace recovered successfully",
      data: result
    }
    // which data should be added and if isdeleted is added : 
    // then the whole logic on the code will change for other servies 
    // because they have to check before operating is is deletd is true or not
  } catch (err) {
    throw err
  }
}

// delete workspace permanaently
async function deleteWorkspacePermanently(userId, workspaceId) {
  // checking if workspace exists
  const workspace = await checkWorkspace(workspaceId)

  // ensuring only owner can delete workspace
  if (workspace.ownerId !== userId) {
    throw new AppError("Unauthorized access", 403)
  }
  // making use of transactions to make sure that all related data is deleted at the same 
  // time to prevent orphan data and maintain data integrity
  await prisma.$transaction([
    prisma.membership.delete({
      where: {
        workspaceId: workspaceId
      }
    }),
    prisma.workspace.delete({
      where: {
        id: workspaceId
      }
    }),
    prisma.task.delete({
      where: {
        workspaceId: workspaceId
      }
    })

  ])
  return {
    success: true, message: "Workspace permanently deleted successfully",
    data: workspaceId
  }
  // which data sould be added and if isdeleted is added : 
  // then the whole logic on the code will change for other servies 
  // because they have to check before operating is is deletd is true or not
}


// trash
async function trash(userId) {
  try {
    // gettig workspaes that are deleted by the user 
    // and calculating the remaining time before permanent deletion
    const deletedWorkspaces = await prisma.workspace.findMany({
      where: {
        deletedAt: {
          not: null
        },
        isDeleted: true,
        ownerId: userId
      }
    });
    // calculating the remaining time before permanent deletion
    const now = new Date();
    // getting the time remaining before permanent deletion for each workspace 
    // and adding it to the response
    const deletedWorkspacesWithTimeout = deletedWorkspaces.map(workspace => {
      // thirty days in milliseconds
      const daysCount = 30 * 24 * 60 * 60 * 1000
      // calculating elapsed time since deletion
      const elapsedTime = now - new Date(workspace.deletedAt);
      // calculating remaining time before permanent deletion
      const remainingTime = Math.max(0, daysCount - elapsedTime);
      return {
        ...workspace,
        // timeout before  automatic permanent deletion of workspace
        timeOutBeforePermanentDeletion: remainingTime
      };
    });
    return {
      success: true,
      message: "These are the workspaces the user has deleted but they can still be recovered within 30 days",
      data: deletedWorkspacesWithTimeout,
    };
  } catch (err) {
    throw err;
  }
}

// automatic deletion of workspace that are deleted for more than 30 days
async function autoDelete() {
  try {
    const now = new Date();

  } catch (err) {
    throw err;
  }
}

export {
  approveUser, deleteWorkspace, deleteWorkspacePermanently, getMembers,
  getUserWorkspace, getWorkspaces, getWorkspaceContent,
  joinWorkspace, leaveWorkspace, recoverWorkspace,
  rejectUser, removeUser, trash, updateUser,
  updateWorkspace, workspaceCreator
};

//                  