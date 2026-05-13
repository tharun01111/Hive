import { z } from "zod";

const uuid = z.string().uuid();
const nonEmptyString = z.string().trim().min(1);
const optionalText = z.string().trim().optional().nullable();
const role = z.enum(["ADMIN", "MEMBER"]).optional();
const strictDateString = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};
const dateLike = z
  .string()
  .refine(strictDateString, {
    message: "Date must be a valid YYYY-MM-DD date",
  })
  .optional()
  .nullable();
const positiveLimit = z.coerce.number().int().min(1).max(100).optional();

export const authSchemas = {
  register: z.object({
    body: z.object({
      name: nonEmptyString.max(100),
      email: z.string().trim().email().max(255),
      password: z.string().min(8).max(128),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().trim().email().max(255),
      password: z.string().min(1).max(128),
    }),
  }),
  refresh: z.object({
    cookies: z.object({
      refreshToken: nonEmptyString,
    }),
  }),
};

export const workspaceSchemas = {
  workspaceId: z.object({ params: z.object({ workspaceId: uuid }) }),
  create: z.object({
    body: z.object({
      name: nonEmptyString.max(120),
      description: optionalText,
    }),
  }),
  update: z.object({
    params: z.object({ workspaceId: uuid }),
    body: z.object({
      name: nonEmptyString.max(120),
      description: optionalText,
    }),
  }),
  invite: z.object({
    params: z.object({ workspaceId: uuid }),
    body: z.object({
      email: z.string().trim().email().max(255),
      role,
    }),
  }),
  removeMember: z.object({
    params: z.object({ workspaceId: uuid, userId: uuid }),
  }),
};

export const projectSchemas = {
  workspaceProjectList: z.object({ params: z.object({ workspaceId: uuid }) }),
  create: z.object({
    params: z.object({ workspaceId: uuid }),
    body: z.object({
      name: nonEmptyString.max(120),
      description: optionalText,
    }),
  }),
  projectId: z.object({ params: z.object({ projectId: uuid }) }),
  update: z.object({
    params: z.object({ projectId: uuid }),
    body: z.object({
      name: nonEmptyString.max(120),
      description: optionalText,
    }),
  }),
  invite: z.object({
    params: z.object({ projectId: uuid }),
    body: z.object({
      email: z.string().trim().email().max(255),
      role,
    }),
  }),
  removeMember: z.object({
    params: z.object({ projectId: uuid, userId: uuid }),
  }),
};

export const kanbanSchemas = {
  projectId: z.object({ params: z.object({ projectId: uuid }) }),
  createColumn: z.object({
    params: z.object({ projectId: uuid }),
    body: z.object({ name: nonEmptyString.max(120) }),
  }),
  updateColumn: z.object({
    params: z.object({ projectId: uuid, columnId: uuid }),
    body: z.object({ name: nonEmptyString.max(120) }),
  }),
  columnId: z.object({
    params: z.object({ projectId: uuid, columnId: uuid }),
  }),
  reorderColumns: z.object({
    params: z.object({ projectId: uuid }),
    body: z.object({
      columns: z
        .array(z.object({ id: uuid, order: z.number().int().min(0) }))
        .min(1),
    }),
  }),
  createCard: z.object({
    params: z.object({ projectId: uuid, columnId: uuid }),
    body: z.object({
      title: nonEmptyString.max(200),
      description: optionalText,
      dueDate: dateLike,
    }),
  }),
  cardId: z.object({
    params: z.object({ projectId: uuid, cardId: uuid }),
  }),
  updateCard: z.object({
    params: z.object({ projectId: uuid, cardId: uuid }),
    body: z.object({
      title: nonEmptyString.max(200),
      description: optionalText,
      dueDate: dateLike,
    }),
  }),
  moveCard: z.object({
    params: z.object({ projectId: uuid, cardId: uuid }),
    body: z.object({
      columnId: uuid,
      order: z.number().int().min(0),
    }),
  }),
  reorderCards: z.object({
    params: z.object({ projectId: uuid }),
    body: z.object({
      cards: z
        .array(
          z.object({
            id: uuid,
            columnId: uuid,
            order: z.number().int().min(0),
          }),
        )
        .min(1),
    }),
  }),
  assignCard: z.object({
    params: z.object({ projectId: uuid, cardId: uuid }),
    body: z.object({ userId: uuid }),
  }),
  unassignCard: z.object({
    params: z.object({ projectId: uuid, cardId: uuid, userId: uuid }),
  }),
};

export const messageSchemas = {
  list: z.object({
    params: z.object({ projectId: uuid }),
    query: z.object({
      cursor: uuid.optional(),
      limit: positiveLimit,
    }),
  }),
  create: z.object({
    params: z.object({ projectId: uuid }),
    body: z.object({ content: nonEmptyString.max(5000) }),
  }),
  delete: z.object({
    params: z.object({ projectId: uuid, messageId: uuid }),
  }),
};

export const notificationSchemas = {
  notificationId: z.object({ params: z.object({ notificationId: uuid }) }),
};

export const activitySchemas = {
  workspaceList: z.object({
    params: z.object({ workspaceId: uuid }),
    query: z.object({ cursor: uuid.optional(), limit: positiveLimit }),
  }),
  projectList: z.object({
    params: z.object({ projectId: uuid }),
    query: z.object({ cursor: uuid.optional(), limit: positiveLimit }),
  }),
};
