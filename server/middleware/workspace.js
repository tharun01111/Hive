import prisma from "../lib/prisma.js";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const hasValidId = (id) => typeof id === "string" && uuidPattern.test(id);

export const requireWorkspaceMember = async (req, res, next) => {
  const { workspaceId } = req.params;

  if (!hasValidId(workspaceId)) {
    return res.status(400).json({ error: "Invalid workspaceId" });
  }

  try {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: req.userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: "Not a member of this workspace" });
    }

    req.workspaceRole = member.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const requireWorkspaceAdmin = async (req, res, next) => {
  const { workspaceId } = req.params;

  if (!hasValidId(workspaceId)) {
    return res.status(400).json({ error: "Invalid workspaceId" });
  }

  try {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: req.userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: "Not a member of this workspace" });
    }

    if (member.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.workspaceRole = member.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const requireProjectMember = async (req, res, next) => {
  const { projectId } = req.params;

  if (!hasValidId(projectId)) {
    return res.status(400).json({ error: "Invalid projectId" });
  }

  try {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: "Not a member of this project" });
    }

    req.projectRole = member.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const requireProjectAdmin = async (req, res, next) => {
  const { projectId } = req.params;

  if (!hasValidId(projectId)) {
    return res.status(400).json({ error: "Invalid projectId" });
  }

  try {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: "Not a member of this project" });
    }

    if (member.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.projectRole = member.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
