import prisma from "../lib/prisma.js";
import { createMessage, deleteMessage } from "../services/message.service.js";

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

export const registerChatHandlers = (io, socket) => {
  socket.on("message:send", async (data) => {
    const { projectId, content, clientId } = data;

    if (!projectId || !content?.trim()) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) {
        socket.emit("message:send:error", {
          clientId,
          message: "Not authorized for this project",
        });
        return;
      }

      const message = await createMessage({
        content,
        projectId,
        userId: socket.userId,
      });

      socket.emit("message:send:ack", { message, projectId, clientId });
      io.to(`project:${projectId}`).emit("message:received", {
        message,
        projectId,
        clientId,
      });
    } catch (err) {
      console.error("Socket message:send error:", err);
      socket.emit("message:send:error", {
        clientId,
        message: "Failed to send message",
      });
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("typing:start", async (data) => {
    const { projectId, userName } = data;

    if (!projectId || !userName) return;
    if (!(await requireProjectMember(socket, projectId))) return;

    socket.to(`project:${projectId}`).emit("typing:started", {
      userId: socket.userId,
      userName,
      projectId,
    });
  });

  socket.on("typing:stop", async (data) => {
    const { projectId } = data;

    if (!projectId) return;
    if (!(await requireProjectMember(socket, projectId))) return;

    socket.to(`project:${projectId}`).emit("typing:stopped", {
      userId: socket.userId,
      projectId,
    });
  });

  socket.on("message:delete", async (data) => {
    const { messageId, projectId } = data;

    if (!messageId || !projectId) return;

    try {
      if (!(await requireProjectMember(socket, projectId))) return;

      await deleteMessage(projectId, messageId, socket.userId);

      io.to(`project:${projectId}`).emit("message:deleted", {
        messageId,
        projectId,
      });
    } catch (err) {
      console.error("Socket message:delete error:", err);
      socket.emit("error", {
        message: err.message ?? "Failed to delete message",
      });
    }
  });
};
