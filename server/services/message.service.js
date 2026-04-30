import prisma from "../lib/prisma.js";

const messageWithUser = {
  user: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
};

export const getProjectMessages = async (projectId, { cursor, limit = 50 }) => {
  const messages = await prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: Number(limit),
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    include: messageWithUser,
  });

  const nextCursor =
    messages.length === Number(limit) ? messages[messages.length - 1].id : null;

  return { messages: messages.reverse(), nextCursor };
};

export const createMessage = async ({ content, projectId, userId }) => {
  return prisma.message.create({
    data: { content: content.trim(), projectId, userId },
    include: messageWithUser,
  });
};

export const deleteMessage = async (projectId, messageId, userId) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw { status: 404, message: "Message not found" };
  }

  if (message.projectId !== projectId) {
    throw { status: 404, message: "Message not found in this project" };
  }

  if (message.userId !== userId) {
    throw { status: 403, message: "You can only delete your own messages" };
  }

  return prisma.message.delete({ where: { id: messageId } });
};
