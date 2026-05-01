import prisma from "../../config/prima.js";
import "dotenv/config";
import content from "../../middleware/read.json.js";
import { AppError } from "../../middleware/apperror.js";

// a function to check if a workspace exists or not
const checkWorkspace = async (workspaceId) => {
  const workspace = await prisma.workspace.findUniqueOrThrow({
    // 400 if not valid input and 404 if not found
    where: { id: workspaceId },
  });
  return workspace;
};

// service to create a new workspace
export async function workspaceCreator(workspaceCreationData, userId) {
  try {
    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceCreationData.workspaceName,
        description: workspaceCreationData.description,
        mode: workspaceCreationData.mode,
        category: workspaceCreationData.category,
        ownerId: userId,
      },
    });
    const membership = await prisma.membership.create({
      data: {
        userId: userId,
        workspaceId: workspace.id,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    return {
      error: false,
      message: "Workspace successfully created",
      data: {
        payload: {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          mode: workspace.mode,
          categories: workspace.category,
          ownerId: workspace.ownerId,
          createdAt: workspace.createdAt.toISOString(),
          role: membership.role,
          accessLevel: membership.role === "ADMIN" ? "ADMIN" : "MEMBER",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      statusCode: 200,
    };
  } catch (err) {
    if (err.code === "P2002") {
      throw new AppError("Workspace already exists", 400);
    }
    throw err;
  }
}

// getting all available workspaces
export async function getWorkspaces(query, userId) {
  let workspace;
  try {
    if (query.category === "" || !query.category) {
      workspace = await prisma.workspace.findMany({
        where: {
          mode: "PUBLIC",
        },
        include: {
          memberships: {
            where: { userId: userId },
          },
        },
      });
    }
    const workspaces = workspace.map((w) => {
      const membership = w.memberships[0];
      return {
        workspaceId: w.id || null,
        name: w.name,
        description: w.description,
        mode: w.mode,
        categories: w.category,
        createdAt: w.createdAt.toISOString(),
        status: membership?.status || null,
        role: membership?.role || null,
        isMember: membership?.status === "ACTIVE",
      };
    });
    return {
      error: false,
      message: "Workspaces fetched successfully",
      data: {
        payload: {
          workspaces,
        },
        meta: {
          count: workspaces.length,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode: 201,
    };
  } catch (err) {
    throw err;
  }
}

//getting a specific user workspaces
export async function getUserWorkspace(query, userId) {
  try {
    let membership;

    if (query.category === "" || !query.category) {
      membership = await prisma.membership.findMany({
        where: {
          userId: userId,
        },
        include: { workspace: true },
      });
    }
    const workspace = membership.map((m) => ({
      workspaceId: m.workspaceId,
      name: m.workspace.name,
      description: m.workspace.description,
      mode: m.workspace.mode,
      category: m.workspace.category,
      createdAt: m.workspace.createdAt.toISOString(),
      isMember: true,
      role: m.role,
      status: m.status,
    }));

    return {
      error: false,
      message: "Workspaces fetched successfully",
      data: {
        payload: workspace,
        meta: {
          count: workspace.length,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode: 200,
    };
  } catch (err) {
    throw err;
  }
}

// getting or entering a specific workspace
export async function getWorkspaceContent(userId, workspaceId) {
  try {
    const workspace = await checkWorkspace(workspaceId);

    let membership = null;
    if (userId) {
      membership = await prisma.membership.findFirst({
        where: {
          userId: userId,
          workspaceId: workspaceId,
        },
      });
    }
    const { id, name, description, mode, category, ownerId, createdAt } =
      workspace;
    const role = membership?.role || null;
    const accessLevel = role
      ? role === "ADMIN"
        ? "ADMIN"
        : "MEMBER"
      : "VIEW_ONLY";

    if ((!membership || membership.status !== "ACTIVE") && mode === "PRIVATE") {
      throw new AppError("User not authorised to access this resource", 403);
    }

    return {
      data: {
        payload: {
          id,
          name,
          description,
          mode,
          category,
          ownerId: membership ? ownerId : null,
          createdAt: createdAt.toISOString(),
          role,
          accessLevel,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      error: false,
      message: "Workspace fetched successfully",
      statusCode: 200,
    };
  } catch (err) {
    if (err.code === "P2025") {
      throw new AppError("Workspace does not exist", 404);
    }
    throw err;
  }
}

// joining a specific workspace
export async function joinWorkspace(userId, workspaceId) {
  try {
    const check = await checkWorkspace(workspaceId);
    if (check.ownerId === userId) {
      throw new AppError("Owner is already part of this workspace", 409);
    }
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId,
        },
      },
    });

    let join;
    if (membership) {
      switch (membership.status) {
        case "ACTIVE":
          throw new AppError("Already a member", 409);
        case "PENDING":
          throw new AppError("Already has a pending request sent", 409);
        case "LEFT":
          join = await prisma.membership.update({
            where: {
              userId_workspaceId: {
                userId: userId,
                workspaceId: workspaceId,
              },
            },
            data: {
              status: check.mode === "PRIVATE" ? "PENDING" : "ACTIVE",
            },
          });
          break;
        default:
          throw new AppError("Invalid membership state", 500);
      }
    } else {
      join = await prisma.membership.create({
        data: {
          userId: userId,
          workspaceId: workspaceId,
          role: "MEMBER",
          status: check.mode === "PRIVATE" ? "PENDING" : "ACTIVE",
        },
      });
    }

    return {
      error: false,
      data: {
        payload: {
          workspaceId: check.id,
          role: join.role,
          accessLevel: join.status === "ACTIVE" ? "MEMBER" : "VIEW_ONLY",
          status: join.status,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      message:
        check.mode === "PUBLIC"
          ? "Workspace joined successfully"
          : "Workspace request sent",
      statusCode: 200,
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
export async function getMembers(userId, workspaceId) {
  try {
    const workspace = await checkWorkspace(workspaceId);

    const authorised = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId,
        },
      },
    });
    if (!authorised) {
      throw new AppError("Unauthorised access, not a member", 403)
    }
    if(authorised.status === "PENDING"){
      throw new AppError("Unauthorised access", 403)
    }
    let isAdmin = authorised.role === "ADMIN"

    const members = await prisma.membership.findMany({
      where: {
        workspaceId: workspaceId,
        status: {
          notIn: ["LEFT", "REMOVED"]
        }
      },
      select: {
        userId: true, role: true, status: isAdmin
      }
    })


    const content = members;

    return {
      error: false,
      data: {
        payload: content,
        meta: {
          timestamp: new Date().toISOString(),
          count: members.length
        }
      },
      message: "Members fetched successfully",
      statusCode: 200
    }
  } catch (err) {

    throw err
  }
}

export async function approveUser(requesterId, workspaceId, targetUserId) {
  try {
    const workspace = await checkWorkspace(workspaceId); // checking if workspace exists

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: requesterId, workspaceId: workspaceId
        }
      }
    })
    if (!membership) {
      throw new AppError("Unauthorised access, not a member", 403)
    }
    if (membership.role !== "ADMIN" || membership.status !== "ACTIVE") {
      throw new AppError("Unauthorised access", 403);
    }
    if (requesterId === targetUserId) {
      throw new AppError("Cannot approve yourself", 409)
    }
    const checkReq = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId: workspaceId
        }
      }
    })
    if (!checkReq) {
      throw new AppError("Request not found", 404)
    }
    if (checkReq.status !== "PENDING") {
      throw new AppError("User is not in  pending state", 409)
    }
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
    return { workspaceId, targetUserId, status: update.status, role: update.role, statusCode: 200 }
  } catch (err) {

    throw err
  }
}