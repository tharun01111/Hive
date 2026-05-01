import prisma from "../lib/prisma.js";
import {
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
  createCard,
  updateCard,
  moveCard,
  deleteCard,
  reorderCards,
  assignCard,
  unassignCard,
} from "../services/kanban.service.js";
import { logActivity } from "../utils/activity.js";
import { sendNotification } from "../utils/notification.js";

const getProject = async (projectId) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true, name: true },
  });
};

const isProjectMember = async (projectId, userId) => {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return Boolean(member);
};

const requireProjectMember = async (socket, projectId) => {
  if (!(await isProjectMember(projectId, socket.userId))) {
    socket.emit("error", { message: "Not authorized for this project" });
    return false;
  }
  return true;
};

const logProjectActivity = async ({
  io,
  socket,
  projectId,
  type,
  entity,
  entityId,
  meta,
}) => {
  const project = await getProject(projectId);
  if (!project) return;

  await logActivity({
    workspaceId: project.workspaceId,
    projectId,
    userId: socket.userId,
    type,
    entity,
    entityId,
    meta,
    io,
  });
};

export const registerKanbanHandlers = (io, socket) => {
  socket.on("card:move", async (data) => {
    const { cardId, columnId, order, projectId } = data;
    if (!cardId || !columnId || order === undefined || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) return;
      const card = await moveCard(projectId, cardId, { columnId, order });
      io.to(`project:${projectId}`).emit("card:moved", { card, projectId });
      await logProjectActivity({
        io,
        socket,
        projectId,
        type: "CARD_MOVED",
        entity: "card",
        entityId: cardId,
        meta: { title: card.title, columnId },
      });
    } catch (err) {
      console.error("Socket card:move error:", err);
      socket.emit("error", { message: err.message ?? "Failed to move card" });
    }
  });

  socket.on("card:create", async (data) => {
    const { columnId, title, description, dueDate, projectId, clientId } = data;
    if (!columnId || !title?.trim() || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) {
        socket.emit("card:create:error", {
          clientId,
          message: "Not authorized for this project",
        });
        return;
      }
      const card = await createCard({
        title,
        description,
        dueDate,
        columnId,
        projectId,
      });
      socket.emit("card:create:ack", { card, projectId, clientId });
      io.to(`project:${projectId}`).emit("card:created", {
        card,
        projectId,
        clientId,
      });
      await logProjectActivity({
        io,
        socket,
        projectId,
        type: "CARD_CREATED",
        entity: "card",
        entityId: card.id,
        meta: { title: card.title },
      });
    } catch (err) {
      console.error("Socket card:create error:", err);
      socket.emit("card:create:error", {
        clientId,
        message: err.message ?? "Failed to create card",
      });
      socket.emit("error", { message: err.message ?? "Failed to create card" });
    }
  });

  socket.on("card:update", async (data) => {
    const { cardId, title, description, dueDate, projectId } = data;
    if (!cardId || !title?.trim() || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) return;
      const card = await updateCard(projectId, cardId, {
        title,
        description,
        dueDate,
      });
      socket.emit("card:update:ack", { card, projectId });
      io.to(`project:${projectId}`).emit("card:updated", { card, projectId });
      await logProjectActivity({
        io,
        socket,
        projectId,
        type: "CARD_UPDATED",
        entity: "card",
        entityId: cardId,
        meta: { title: card.title },
      });
    } catch (err) {
      console.error("Socket card:update error:", err);
      socket.emit("card:update:error", {
        cardId,
        message: err.message ?? "Failed to update card",
      });
      socket.emit("error", { message: err.message ?? "Failed to update card" });
    }
  });

  socket.on("card:delete", async (data) => {
    const { cardId, projectId } = data;
    if (!cardId || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) return;
      const card = await deleteCard(projectId, cardId);
      socket.emit("card:delete:ack", { cardId, projectId });
      io.to(`project:${projectId}`).emit("card:deleted", { cardId, projectId });
      await logProjectActivity({
        io,
        socket,
        projectId,
        type: "CARD_DELETED",
        entity: "card",
        entityId: cardId,
        meta: { title: card?.title },
      });
    } catch (err) {
      console.error("Socket card:delete error:", err);
      socket.emit("card:delete:error", {
        cardId,
        message: err.message ?? "Failed to delete card",
      });
      socket.emit("error", { message: err.message ?? "Failed to delete card" });
    }
  });

  socket.on("card:assign", async (data) => {
    const { cardId, userId, projectId } = data;
    if (!cardId || !userId || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) return;
      await assignCard(projectId, cardId, userId);

      const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: {
          assignees: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
        },
      });

      io.to(`project:${projectId}`).emit("card:assigned", { card, projectId });

      if (userId !== socket.userId) {
        const assigner = await prisma.user.findUnique({
          where: { id: socket.userId },
          select: { name: true },
        });

        await sendNotification({
          userId,
          type: "CARD_ASSIGNED",
          message: `${assigner.name} assigned you to "${card.title}"`,
          entityId: cardId,
          io,
        });
      }

      await logProjectActivity({
        io,
        socket,
        projectId,
        type: "CARD_ASSIGNED",
        entity: "card",
        entityId: cardId,
        meta: { title: card.title, assignedUserId: userId },
      });
    } catch (err) {
      console.error("Socket card:assign error:", err);
      socket.emit("error", { message: err.message ?? "Failed to assign card" });
    }
  });

  socket.on("card:unassign", async (data) => {
    const { cardId, userId, projectId } = data;
    if (!cardId || !userId || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) return;
      await unassignCard(projectId, cardId, userId);

      const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: {
          assignees: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
        },
      });

      io.to(`project:${projectId}`).emit("card:unassigned", {
        card,
        projectId,
      });
    } catch (err) {
      console.error("Socket card:unassign error:", err);
      socket.emit("error", {
        message: err.message ?? "Failed to unassign card",
      });
    }
  });

  socket.on("column:create", async (data) => {
    const { name, projectId, clientId } = data;
    if (!name?.trim() || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) {
        socket.emit("column:create:error", {
          clientId,
          message: "Not authorized for this project",
        });
        return;
      }
      const column = await createColumn({ name, projectId });
      socket.emit("column:create:ack", { column, projectId, clientId });
      io.to(`project:${projectId}`).emit("column:created", {
        column,
        projectId,
        clientId,
      });
      await logProjectActivity({
        io,
        socket,
        projectId,
        type: "COLUMN_CREATED",
        entity: "column",
        entityId: column.id,
        meta: { name: column.name },
      });
    } catch (err) {
      console.error("Socket column:create error:", err);
      socket.emit("column:create:error", {
        clientId,
        message: err.message ?? "Failed to create column",
      });
      socket.emit("error", {
        message: err.message ?? "Failed to create column",
      });
    }
  });

  socket.on("column:update", async (data) => {
    const { columnId, name, projectId } = data;
    if (!columnId || !name?.trim() || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) return;
      const column = await updateColumn(projectId, columnId, { name });
      io.to(`project:${projectId}`).emit("column:updated", {
        column,
        projectId,
      });
      await logProjectActivity({
        io,
        socket,
        projectId,
        type: "COLUMN_UPDATED",
        entity: "column",
        entityId: columnId,
        meta: { name: column.name },
      });
    } catch (err) {
      console.error("Socket column:update error:", err);
      socket.emit("error", {
        message: err.message ?? "Failed to update column",
      });
    }
  });

  socket.on("column:delete", async (data) => {
    const { columnId, projectId } = data;
    if (!columnId || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) return;
      const column = await deleteColumn(projectId, columnId);
      io.to(`project:${projectId}`).emit("column:deleted", {
        columnId,
        projectId,
      });
      await logProjectActivity({
        io,
        socket,
        projectId,
        type: "COLUMN_DELETED",
        entity: "column",
        entityId: columnId,
        meta: { name: column?.name },
      });
    } catch (err) {
      console.error("Socket column:delete error:", err);
      socket.emit("error", {
        message: err.message ?? "Failed to delete column",
      });
    }
  });

  socket.on("columns:reorder", async (data) => {
    const { columns, projectId } = data;
    if (!Array.isArray(columns) || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) return;
      await reorderColumns(projectId, columns);
      io.to(`project:${projectId}`).emit("columns:reordered", {
        columns,
        projectId,
      });
    } catch (err) {
      console.error("Socket columns:reorder error:", err);
      socket.emit("error", {
        message: err.message ?? "Failed to reorder columns",
      });
    }
  });

  socket.on("cards:reorder", async (data) => {
    const { cards, projectId } = data;
    if (!Array.isArray(cards) || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) return;
      await reorderCards(projectId, cards);
      io.to(`project:${projectId}`).emit("cards:reordered", {
        cards,
        projectId,
      });
    } catch (err) {
      console.error("Socket cards:reorder error:", err);
      socket.emit("error", {
        message: err.message ?? "Failed to reorder cards",
      });
    }
  });
};
