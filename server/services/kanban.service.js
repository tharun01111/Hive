import prisma from "../lib/prisma.js";

const MAX_ORDER_RETRIES = 3;

const cardWithAssignees = {
  assignees: {
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
};

const isUniqueConstraintError = (err) => err?.code === "P2002";

const assertColumnInProject = async (columnId, projectId) => {
  const column = await prisma.column.findFirst({
    where: { id: columnId, projectId },
  });

  if (!column) {
    throw { status: 404, message: "Column not found in this project" };
  }

  return column;
};

const assertCardInProject = async (cardId, projectId) => {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      column: { projectId },
    },
    include: cardWithAssignees,
  });

  if (!card) {
    throw { status: 404, message: "Card not found in this project" };
  }

  return card;
};

const assertProjectMember = async (projectId, userId) => {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!member) {
    throw { status: 400, message: "User is not a member of this project" };
  }

  return member;
};

export const getProjectColumns = async (projectId) => {
  return prisma.column.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    include: {
      cards: {
        orderBy: { order: "asc" },
        include: cardWithAssignees,
      },
    },
  });
};

export const createColumn = async ({ name, projectId }) => {
  const trimmedName = name.trim();

  for (let attempt = 0; attempt < MAX_ORDER_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const lastColumn = await tx.column.findFirst({
          where: { projectId },
          orderBy: { order: "desc" },
        });

        const order = lastColumn ? lastColumn.order + 1 : 0;

        return tx.column.create({
          data: { name: trimmedName, order, projectId },
          include: { cards: true },
        });
      });
    } catch (err) {
      if (!isUniqueConstraintError(err) || attempt === MAX_ORDER_RETRIES - 1) {
        throw err;
      }
    }
  }

  throw { status: 409, message: "Could not allocate column order" };
};

export const updateColumn = async (projectId, columnId, { name }) => {
  await assertColumnInProject(columnId, projectId);

  return prisma.column.update({
    where: { id: columnId },
    data: { name: name.trim() },
  });
};

export const deleteColumn = async (projectId, columnId) => {
  await assertColumnInProject(columnId, projectId);

  return prisma.column.delete({ where: { id: columnId } });
};

export const reorderColumns = async (projectId, columns) => {
  const ids = columns.map((col) => col.id);
  const matchingColumns = await prisma.column.count({
    where: { id: { in: ids }, projectId },
  });

  if (matchingColumns !== ids.length) {
    throw { status: 400, message: "All columns must belong to this project" };
  }

  return prisma.$transaction([
    ...columns.map((col, index) =>
      prisma.column.update({
        where: { id: col.id },
        data: { order: -index - 1 },
      }),
    ),
    ...columns.map((col) =>
      prisma.column.update({
        where: { id: col.id },
        data: { order: col.order },
      }),
    ),
  ]);
};

export const createCard = async ({
  title,
  description,
  dueDate,
  columnId,
  projectId,
}) => {
  await assertColumnInProject(columnId, projectId);

  const trimmedTitle = title.trim();
  const trimmedDescription = description?.trim();
  const parsedDueDate = dueDate ? new Date(dueDate) : null;

  for (let attempt = 0; attempt < MAX_ORDER_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const lastCard = await tx.card.findFirst({
          where: { columnId },
          orderBy: { order: "desc" },
        });

        const order = lastCard ? lastCard.order + 1 : 0;

        return tx.card.create({
          data: {
            title: trimmedTitle,
            description: trimmedDescription,
            dueDate: parsedDueDate,
            order,
            columnId,
          },
          include: cardWithAssignees,
        });
      });
    } catch (err) {
      if (!isUniqueConstraintError(err) || attempt === MAX_ORDER_RETRIES - 1) {
        throw err;
      }
    }
  }

  throw { status: 409, message: "Could not allocate card order" };
};

export const getCardById = async (projectId, cardId) => {
  return assertCardInProject(cardId, projectId);
};

export const updateCard = async (
  projectId,
  cardId,
  { title, description, dueDate },
) => {
  await assertCardInProject(cardId, projectId);

  return prisma.card.update({
    where: { id: cardId },
    data: {
      title: title.trim(),
      description: description?.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: cardWithAssignees,
  });
};

export const moveCard = async (projectId, cardId, { columnId, order }) => {
  await assertCardInProject(cardId, projectId);
  await assertColumnInProject(columnId, projectId);

  return prisma.card.update({
    where: { id: cardId },
    data: { columnId, order },
    include: cardWithAssignees,
  });
};

export const deleteCard = async (projectId, cardId) => {
  await assertCardInProject(cardId, projectId);

  return prisma.card.delete({ where: { id: cardId } });
};

export const reorderCards = async (projectId, cards) => {
  const cardIds = cards.map((card) => card.id);
  const columnIds = [...new Set(cards.map((card) => card.columnId))];

  const [matchingCards, matchingColumns] = await Promise.all([
    prisma.card.count({
      where: { id: { in: cardIds }, column: { projectId } },
    }),
    prisma.column.count({
      where: { id: { in: columnIds }, projectId },
    }),
  ]);

  if (
    matchingCards !== cardIds.length ||
    matchingColumns !== columnIds.length
  ) {
    throw {
      status: 400,
      message: "All cards and columns must belong to this project",
    };
  }

  return prisma.$transaction([
    ...cards.map((card, index) =>
      prisma.card.update({
        where: { id: card.id },
        data: { order: -index - 1 },
      }),
    ),
    ...cards.map((card) =>
      prisma.card.update({
        where: { id: card.id },
        data: { order: card.order, columnId: card.columnId },
      }),
    ),
  ]);
};

export const assignCard = async (projectId, cardId, userId) => {
  await assertCardInProject(cardId, projectId);
  await assertProjectMember(projectId, userId);

  const existing = await prisma.cardAssignee.findUnique({
    where: { cardId_userId: { cardId, userId } },
  });

  if (existing) {
    throw { status: 409, message: "User already assigned to this card" };
  }

  return prisma.cardAssignee.create({
    data: { cardId, userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });
};

export const unassignCard = async (projectId, cardId, userId) => {
  await assertCardInProject(cardId, projectId);

  const result = await prisma.cardAssignee.deleteMany({
    where: { cardId, userId },
  });

  if (result.count === 0) {
    throw { status: 404, message: "Card assignment not found" };
  }

  return result;
};
