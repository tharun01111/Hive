import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { verifyAccessToken } from "../utils/tokens.js";
import { registerKanbanHandlers } from "./kanban.handlers.js";
import { registerChatHandlers } from "./chat.handlers.js";
import prisma from "../lib/prisma.js";

const isProjectMember = async (projectId, userId) => {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return Boolean(member);
};

const isWorkspaceMember = async (workspaceId, userId) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  return Boolean(member);
};

const projectPresence = new Map();

const getPresenceList = (projectId) =>
  Array.from(projectPresence.get(projectId)?.values() ?? []).map(
    ({ user, lastSeen }) => ({ ...user, lastSeen }),
  );

const emitPresence = (io, projectId) => {
  io.to(`project:${projectId}`).emit("presence:update", {
    projectId,
    users: getPresenceList(projectId),
  });
};

const addPresence = async (io, socket, projectId) => {
  const user = await prisma.user.findUnique({
    where: { id: socket.userId },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  if (!user) return;

  if (!projectPresence.has(projectId)) {
    projectPresence.set(projectId, new Map());
  }

  const projectUsers = projectPresence.get(projectId);
  const current = projectUsers.get(socket.userId);
  projectUsers.set(socket.userId, {
    user,
    lastSeen: new Date().toISOString(),
    sockets: new Set([...(current?.sockets ?? []), socket.id]),
  });

  socket.data.projectPresence ??= new Set();
  socket.data.projectPresence.add(projectId);
  emitPresence(io, projectId);
};

const removePresence = (io, socket, projectId) => {
  const projectUsers = projectPresence.get(projectId);
  if (!projectUsers) return;

  const current = projectUsers.get(socket.userId);
  if (!current) return;

  current.sockets.delete(socket.id);
  if (current.sockets.size === 0) {
    projectUsers.delete(socket.userId);
  } else {
    projectUsers.set(socket.userId, current);
  }

  if (projectUsers.size === 0) {
    projectPresence.delete(projectId);
  }

  socket.data.projectPresence?.delete(projectId);
  emitPresence(io, projectId);
};

export const initSocket = async (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
    path: "/socket.io",
  });

  const pubClient = new Redis(process.env.REDIS_URL);
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      next();
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.userId})`);

    socket.on("join:project", async (projectId) => {
      if (!(await isProjectMember(projectId, socket.userId))) {
        socket.emit("error", { message: "Not authorized for this project" });
        return;
      }
      socket.join(`project:${projectId}`);
      await addPresence(io, socket, projectId);
      console.log(`User ${socket.userId} joined project:${projectId}`);
    });

    socket.on("leave:project", (projectId) => {
      removePresence(io, socket, projectId);
      socket.leave(`project:${projectId}`);
    });

    socket.on("presence:heartbeat", ({ projectId }) => {
      const current = projectPresence.get(projectId)?.get(socket.userId);
      if (!current) return;
      current.lastSeen = new Date().toISOString();
      projectPresence.get(projectId).set(socket.userId, current);
      emitPresence(io, projectId);
    });

    socket.on("join:workspace", async (workspaceId) => {
      if (!(await isWorkspaceMember(workspaceId, socket.userId))) {
        socket.emit("error", { message: "Not authorized for this workspace" });
        return;
      }
      socket.join(`workspace:${workspaceId}`);
      console.log(`User ${socket.userId} joined workspace:${workspaceId}`);
    });

    socket.on("leave:workspace", (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    // Every user joins their own private room for targeted notifications
    socket.join(`user:${socket.userId}`);

    registerKanbanHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      for (const projectId of socket.data.projectPresence ?? []) {
        removePresence(io, socket, projectId);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
