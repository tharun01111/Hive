import prisma from "../lib/prisma.js";

const cardWithAssignees = {
  assignees: {
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
};

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
  const lastColumn = await prisma.column.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  const order = lastColumn ? lastColumn.order + 1 : 0;

  return prisma.column.create({
    data: { name: name.trim(), order, projectId },
    include: { cards: true },
  });
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

  return prisma.$transaction(
    columns.map((col) =>
      prisma.column.update({
        where: { id: col.id },
        data: { order: col.order },
      }),
    ),
  );
};

export const createCard = async ({
  title,
  description,
  dueDate,
  columnId,
  projectId,
}) => {
  await assertColumnInProject(columnId, projectId);

  const lastCard = await prisma.card.findFirst({
    where: { columnId },
    orderBy: { order: "desc" },
  });

  const order = lastCard ? lastCard.order + 1 : 0;

  return prisma.card.create({
    data: {
      title: title.trim(),
      description: description?.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      order,
      columnId,
    },
    include: cardWithAssignees,
  });
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

  return prisma.$transaction(
    cards.map((card) =>
      prisma.card.update({
        where: { id: card.id },
        data: { order: card.order, columnId: card.columnId },
      }),
    ),
  );
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

  return prisma.cardAssignee.delete({
    where: { cardId_userId: { cardId, userId } },
  });
};
