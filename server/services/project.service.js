import prisma from "../lib/prisma.js";

const projectWithMembers = {
  members: {
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
};

export const createProject = async ({
  name,
  description,
  workspaceId,
  userId,
}) => {
  return prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim(),
      workspaceId,
      members: {
        create: { userId, role: "ADMIN" },
      },
      columns: {
        create: [
          { name: "Backlog", order: 0 },
          { name: "In Progress", order: 1 },
          { name: "Review", order: 2 },
          { name: "Done", order: 3 },
        ],
      },
    },
    include: projectWithMembers,
  });
};

export const getWorkspaceProjects = async (workspaceId) => {
  return prisma.project.findMany({
    where: { workspaceId },
    include: {
      ...projectWithMembers,
      _count: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getProjectById = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: projectWithMembers,
  });

  if (!project) {
    throw { status: 404, message: "Project not found" };
  }

  return project;
};

export const updateProject = async (projectId, { name, description }) => {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      name: name.trim(),
      description: description?.trim(),
    },
  });
};

export const deleteProject = async (projectId) => {
  return prisma.project.delete({ where: { id: projectId } });
};

export const inviteProjectMember = async (projectId, { email, role }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });

  if (existing) {
    throw { status: 409, message: "User is already a member" };
  }

  const assignedRole = role === "ADMIN" ? "ADMIN" : "MEMBER";

  return prisma.projectMember.create({
    data: { projectId, userId: user.id, role: assignedRole },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });
};
