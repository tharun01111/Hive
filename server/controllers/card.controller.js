import {
  createCard,
  getCardById,
  updateCard,
  moveCard,
  deleteCard,
  reorderCards,
  assignCard,
  unassignCard,
} from "../services/kanban.service.js";
import { handle } from "../utils/controllerHandler.js";

export const createCardController = handle(async (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: "Card title is required" });
  const card = await createCard({
    title,
    description,
    dueDate,
    columnId: req.params.columnId,
    projectId: req.params.projectId,
  });
  return res.status(201).json({ card });
});

export const getCardController = handle(async (req, res) => {
  const card = await getCardById(req.params.projectId, req.params.cardId);
  return res.status(200).json({ card });
});

export const updateCardController = handle(async (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: "Card title is required" });
  const card = await updateCard(req.params.projectId, req.params.cardId, {
    title,
    description,
    dueDate,
  });
  return res.status(200).json({ card });
});

export const moveCardController = handle(async (req, res) => {
  const { columnId, order } = req.body;
  if (!columnId || order === undefined) {
    return res.status(400).json({ error: "columnId and order are required" });
  }
  const card = await moveCard(req.params.projectId, req.params.cardId, {
    columnId,
    order,
  });
  return res.status(200).json({ card });
});

export const deleteCardController = handle(async (req, res) => {
  await deleteCard(req.params.projectId, req.params.cardId);
  return res.status(200).json({ message: "Card deleted successfully" });
});

export const reorderCardsController = handle(async (req, res) => {
  const { cards } = req.body;
  if (!Array.isArray(cards)) {
    return res.status(400).json({ error: "cards must be an array" });
  }
  await reorderCards(req.params.projectId, cards);
  return res.status(200).json({ message: "Cards reordered" });
});

export const assignCardController = handle(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  const assignee = await assignCard(
    req.params.projectId,
    req.params.cardId,
    userId,
  );
  return res.status(201).json({ assignee });
});

export const unassignCardController = handle(async (req, res) => {
  await unassignCard(
    req.params.projectId,
    req.params.cardId,
    req.params.userId,
  );
  return res.status(200).json({ message: "Assignee removed successfully" });
});
