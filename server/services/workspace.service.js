import prisma from "../lib/prisma.js";

export const createWorkspace = async ({ name, description, userId }) => {
  return prisma.workspace.create({
    data: {
      name: name.trim(),
      description: description?.trim(),
      members: {
        create: { userId, role: "ADMIN" },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  });
};

export const getUserWorkspaces = async (userId) => {
  return prisma.workspace.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getWorkspaceById = async (workspaceId) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      projects: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!workspace) {
    throw { status: 404, message: "Workspace not found" };
  }

  return workspace;
};

export const updateWorkspace = async (workspaceId, { name, description }) => {
  return prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: name.trim(),
      description: description?.trim(),
    },
  });
};

export const deleteWorkspace = async (workspaceId) => {
  return prisma.workspace.delete({ where: { id: workspaceId } });
};

export const inviteWorkspaceMember = async (workspaceId, { email, role }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
  });

  if (existing) {
    throw { status: 409, message: "User is already a member" };
  }

  const assignedRole = role === "ADMIN" ? "ADMIN" : "MEMBER";

  return prisma.workspaceMember.create({
    data: { workspaceId, userId: user.id, role: assignedRole },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });
};

export const removeWorkspaceMember = async (
  workspaceId,
  userId,
  requestingUserId,
) => {
  if (userId === requestingUserId) {
    throw { status: 400, message: "You cannot remove yourself" };
  }

  return prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
};
