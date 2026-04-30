import prisma from "../lib/prisma.js";

export const logActivity = async ({
  workspaceId,
  projectId = null,
  userId,
  type,
  entity,
  entityId,
  meta = null,
  io = null,
}) => {
  try {
    const activity = await prisma.activity.create({
      data: {
        workspaceId,
        projectId,
        userId,
        type,
        entity,
        entityId,
        meta,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    // Broadcast to workspace room in real time if io is passed
    if (io) {
      io.to(`workspace:${workspaceId}`).emit("activity:new", { activity });
    }

    return activity;
  } catch (err) {
    // Activity logging should never crash the main flow
    console.error("Failed to log activity:", err);
  }
};
